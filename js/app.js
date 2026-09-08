/* ============================================================
   SHARED HELPERS + STATE
   Loaded right after roster-data.js. Everything else depends on this.
   ============================================================ */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* roster sorted by sweater number — the one order every view uses */
const activeRoster = () => [...ROSTER].sort((a,b)=>a.number-b.number);

/* phonetics: sayLast is the surname, sayFirst the first name.
   sayLine(p) → "ESCOFFIER = es-co-fee-ay" / "Naomi = nay-OH-mee" / both / "" */
const sayLine = p => [
  p.sayLast  ? `${p.lastName.toUpperCase()} = ${p.sayLast}` : null,
  p.sayFirst ? `${p.firstName} = ${p.sayFirst}` : null
].filter(Boolean).join(" · ");

/* ---- Alabama stats: totals are ALWAYS derived from season rows ---- */
function getAlabamaSkaterTotals(p){
  const S = p.alabamaStats;
  if(!S || S.type!=='skater' || !S.seasons || !S.seasons.length) return null;
  const t = S.seasons.reduce((a,s)=>({gp:a.gp+s.gp, g:a.g+s.g, a:a.a+s.a, p:a.p+s.p, pim:a.pim+s.pim}),
                             {gp:0,g:0,a:0,p:0,pim:0});
  t.ppg = t.gp ? +(t.p/t.gp).toFixed(2) : null;
  return t;
}
function getAlabamaGoalieTotals(p){
  const S = p.alabamaStats;
  if(!S || S.type!=='goalie' || !S.seasons || !S.seasons.length) return null;
  const t = S.seasons.reduce((a,s)=>({gp:a.gp+s.gp, w:a.w+s.w, l:a.l+s.l, t:a.t+s.t, so:a.so+s.so, ga:a.ga+s.ga, minutes:a.minutes+s.minutes}),
                             {gp:0,w:0,l:0,t:0,so:0,ga:0,minutes:0});
  t.gaa = t.minutes ? +(t.ga*60/t.minutes).toFixed(2) : null;
  /* combined SV% only when every season supplies saves — otherwise it would be a guess */
  const allSaves = S.seasons.every(s=>s.saves!=null);
  const saves = allSaves ? S.seasons.reduce((a,s)=>a+s.saves,0) : null;
  t.svPct = allSaves && (saves+t.ga) ? +(saves/(saves+t.ga)).toFixed(3) : null;
  return t;
}
const fullName = p => `${p.firstName} ${p.lastName}`;
const surnameOf = name => name.split(" ").pop();

/* program record book (EP snapshot) — where does this player rank? */
const RB_LABELS = {points:"points", goals:"goals", ppg:"P/GP", pim:"PIM", gamesPlayed:"GP"};
function recordBookRanks(p){
  const rb = TEAM.recordBook; if(!rb) return [];
  const name = fullName(p), out = [];
  Object.keys(RB_LABELS).forEach(cat=>{
    const list = rb[cat] || [];
    const e = list.find(x=>x.name===name); if(!e) return;
    const tied = list.filter(x=>x.rank===e.rank).length > 1;
    const value = cat==='ppg' ? e.ppg.toFixed(2) : cat==='pim' ? e.pim : cat==='gamesPlayed' ? e.gp : cat==='goals' ? e.g : e.p;
    out.push({cat, label:RB_LABELS[cat], rank:e.rank, tied, value});
  });
  return out;
}
const recordBookLine = p => {
  const r = recordBookRanks(p);
  return r.length ? "EP record book: " + r.map(x=>`${x.tied?"T-":"#"}${x.rank} ${x.label} (${x.value})`).join(" · ") : "";
};
/* the one record-book tag worth spending call-sheet ink on */
function getBestProgramRecordTag(p){
  const t = getAlabamaSkaterTotals(p); if(!t) return null;
  const rank = cat => (recordBookRanks(p).find(x=>x.cat===cat)||{}).rank;
  if(rank('points')===1) return {prefix:"EP PROGRAM LEADER", suffix: t.ppg!=null ? `${t.ppg.toFixed(2)} P/GP` : null};
  if(rank('goals')<=3)   return {prefix:null, suffix:`EP #${rank('goals')} goals`};
  if(rank('pim')<=3)     return {prefix:null, suffix:`${t.pim} PIM`};
  if(t.ppg>=1)           return {prefix:null, suffix:`${t.ppg.toFixed(2)} P/GP`};
  return null;
}
/* compact call-sheet line, e.g. "ALA · 23 GP · 13G–4A–17P". null when no Alabama games. */
function formatAlabamaStatLine(p){
  const S = p.alabamaStats; if(!S || !S.seasons || !S.seasons.length) return null;
  if(S.type==='goalie'){
    const t = getAlabamaGoalieTotals(p); if(!t || !t.gp) return null;
    return `ALA CAREER · ${t.gp} GP · ${t.w}–${t.l}–${t.t} · ${t.so} SO`;
  }
  const t = getAlabamaSkaterTotals(p); if(!t || !t.gp) return null;
  const tag = getBestProgramRecordTag(p) || {};
  return [tag.prefix || "ALA", `${t.gp} GP`, `${t.g}G–${t.a}A–${t.p}P`, tag.suffix].filter(Boolean).join(" · ");
}
const generatedStatNote = formatAlabamaStatLine;

/* season-by-season split for players with 2+ Alabama seasons (the career line already covers one-season players) */
function seasonSplitNote(p){
  const S = p.alabamaStats; if(!S || !S.seasons || S.seasons.length < 2) return null;
  const yr = s => s.season.replace("-","–");
  if(S.type==='goalie')
    return S.seasons.map(s=>`${yr(s)}: ${s.w}–${s.l}–${s.t} · ${s.gaa!=null?s.gaa.toFixed(2)+" GAA":""}${s.svPct!=null?" · "+s.svPct.toFixed(3).replace(/^0/,"")+" SV%":""} · ${s.so} SO`).join("  |  ");
  return S.seasons.map(s=>`${yr(s)}: ${s.g}G–${s.a}A–${s.p}P in ${s.gp} GP`).join("  |  ");
}

/* every bullet a view may show, best first: generated stat line → priority-1 hooks →
   generated season split → generated record-book ranks → priority 2 → priority 3 */
function noteCandidates(p){
  const gen = [];
  const stat = generatedStatNote(p); if(stat) gen.push({text:stat, category:"stats", priority:0, gen:true});
  const split = seasonSplitNote(p);  if(split) gen.push({text:split, category:"stats", priority:1.5, gen:true});
  const rb = recordBookLine(p);      if(rb) gen.push({text:rb, category:"record", priority:1.6, gen:true});
  return [...gen, ...p.notes].sort((a,b)=>a.priority-b.priority);
}

/* where a player sits in tonight's lineup: ["F1","PP1"], ["D2","PK2"], ["START"], ["NOT ON LINEUP"] … */
function lineTags(p){
  const L = TEAM.lines; if(!L) return [];
  const n = p.number, t = [];
  const has = row => Array.isArray(row) && row.includes(n);
  (L.forwards||[]).forEach((row,i)=>{ if(has(row)) t.push("F"+(i+1)); });
  (L.defense||[]).forEach((row,i)=>{ if(has(row)) t.push("D"+(i+1)); });
  if(has(L.extraDefense)) t.push("7D");
  if((L.goalies||[])[0]===n) t.push("START"); else if(has(L.goalies)) t.push("BACKUP");
  (L.pp||[]).forEach((u,i)=>{ if(has(u)) t.push("PP"+(i+1)); });
  (L.pk||[]).forEach((u,i)=>{ if(has(u)) t.push("PK"+(i+1)); });
  if(has(L.scratched)) t.push("SCRATCHED");
  else if(has(L.notListed)) t.push("NOT ON LINEUP");
  return t;
}

/* age on game day from a full M/D/YYYY date of birth; null for partial or missing dates */
function ageOn(dob, iso){
  if(!dob || !iso) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dob); if(!m) return null;
  const g = new Date(iso+"T12:00:00"), b = new Date(+m[3], +m[1]-1, +m[2]);
  let a = g.getFullYear() - b.getFullYear();
  if(g.getMonth() < b.getMonth() || (g.getMonth()===b.getMonth() && g.getDate() < b.getDate())) a--;
  return a;
}

/* data-quality entries, normalised to the array form */
const dqList = p => !p.dataQuality ? [] : Array.isArray(p.dataQuality) ? p.dataQuality : [{field:null, note:p.dataQuality.note, print:true}];

/* team results: summary derived from game rows; practice rows (counts:false) excluded */
function seasonSummary(season){
  const g = (season.games||[]).filter(x=>x.counts && x.result);
  const s = g.reduce((a,x)=>({gp:a.gp+1, w:a.w+(x.result==='W'), l:a.l+(x.result==='L'), t:a.t+(x.result==='T'), gf:a.gf+x.gf, ga:a.ga+x.ga}),
                     {gp:0,w:0,l:0,t:0,gf:0,ga:0});
  s.diff = s.gf - s.ga;
  return s;
}

/* every counting game across every season (the fundraiser game lives in TEAM.game, never here) */
const allCountingGames = () => (TEAM.seasons||[]).flatMap(s=>s.games.filter(g=>g.counts && g.result));
function aggregateSummary(){
  const g = allCountingGames();
  const s = g.reduce((a,x)=>({gp:a.gp+1, w:a.w+(x.result==='W'), l:a.l+(x.result==='L'), gf:a.gf+x.gf, ga:a.ga+x.ga}), {gp:0,w:0,l:0,gf:0,ga:0});
  s.diff = s.gf - s.ga;
  const one = g.filter(x=>Math.abs(x.gf-x.ga)===1);
  s.oneGoal = {w:one.filter(x=>x.result==='W').length, l:one.filter(x=>x.result==='L').length};
  return s;
}
/* head-to-head by opponent, most games first */
function headToHead(){
  const m = {};
  allCountingGames().forEach(x=>{
    const h = m[x.opp] || (m[x.opp] = {opp:x.opp, gp:0, w:0, l:0, gf:0, ga:0});
    h.gp++; h.w += x.result==='W'; h.l += x.result==='L'; h.gf += x.gf; h.ga += x.ga;
  });
  return Object.values(m).sort((a,b)=>b.gp-a.gp || a.opp.localeCompare(b.opp));
}

/* sanity checks — loud in the console, never on the sheet */
function validateRoster(){
  const nums = ROSTER.map(p=>p.number);
  if(new Set(nums).size !== nums.length) console.error('ROSTER: duplicate sweater numbers');
  ROSTER.forEach(p=>{
    const S = p.alabamaStats; if(!S) return;
    S.seasons.forEach(s=>{
      if(S.type==='skater' && s.p !== s.g + s.a) console.error(`ROSTER: #${p.number} ${p.lastName} ${s.season} P≠G+A`);
      if(S.type==='goalie' && s.gp !== s.w + s.l + s.t) console.error(`ROSTER: #${p.number} ${p.lastName} ${s.season} GP≠W+L+T`);
    });
  });
}
validateRoster();

/* localStorage with an in-memory fallback (file:// in some browsers blocks storage) */
let mem = {};
const store = {
  read(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return mem[key] ?? fallback; } },
  write(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ mem[key] = val; } }
};

/* study progress, keyed by sweater number */
let progress = store.read('bamaStudy', {});
const pState = n => progress[n] || (progress[n] = {seen:false, correct:0, wrong:0, mastered:false});
const saveProgress = () => store.write('bamaStudy', progress);

/* ---- view switching ---- */
function showView(v){
  $$('.view').forEach(s=>s.classList.remove('active'));
  $('#view-'+v).classList.add('active');
  $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===v));
  if(v==='sheet'){ scaleSheet(); autoFit(); }
  if(v==='flash') renderFlash();
  if(v==='quiz') nextQuestion();
}
$$('.tab').forEach(t=> t.onclick = ()=> showView(t.dataset.view));
