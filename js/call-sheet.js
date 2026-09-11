/* ============================================================
   CALL SHEET + TEAM SHEET RENDER
   renderPages() builds every printed page from ROSTER / TEAM:
     portrait  → 2 pages  (call sheet, team sheet)            [default]
     landscape → 4 pages  (call sheet rows split in two, then the
                           team sheet's info half and lineup half)
   print-fit.js decides the final text scale after this runs.
   ============================================================ */
const LAYOUT = { mode: store.read('bamaLayout', 'portrait') };
const isLandscape = () => LAYOUT.mode === 'landscape';

/* one printed page. Head / column header / footer are the same chrome on every page. */
function pageShell({cls, id, headLeft="ALABAMA WOMEN'S HOCKEY", headRight, colA, colB, foot, body}){
  return `<div class="sheet-stage"><div class="print-page ${cls}${isLandscape()?' land':''}" id="${id}">
    <div class="cs-head"><div class="l">${headLeft}</div><div class="r">${headRight}</div></div>
    <div class="cs-colhead"><div class="a">${colA}</div><div class="b">${colB}</div></div>
    ${body}
    <div class="cs-foot">${foot.map(f=>`<span>${f}</span>`).join("")}</div>
  </div></div>`;
}
function headRight(prefix){
  const G = TEAM.game; if(!G) return prefix || "";
  const vs = `ALABAMA&nbsp;<em>vs</em>&nbsp;${G.opponent.replace(/^HSV /,"").toUpperCase()}`;
  return `<span>${prefix?prefix+" &nbsp;·&nbsp; ":""}${vs} &nbsp;·&nbsp; ${G.date}${prefix?"":" &nbsp;·&nbsp; "+G.time}</span>` +
    (G.counts===false ? `<small>${G.label}${prefix?"":" · SUPPORTING ALABAMA WOMEN'S HOCKEY"} · NON-COUNTING GAME</small>` : "");
}
const staffFoot = () => TEAM.staff.map(s=>`${s.role.replace("Head Coach","HC").replace("Assistant Coach","AC").replace("Head of Staff","HoS")} ${s.name}`).join(" &nbsp;·&nbsp; ");

/* every candidate bullet is rendered; fitNotes() then hides trailing ones per row until the
   row fits at the current text size. The first MANDATORY bullets always stay (the generated
   stat line + best hook), so print-fit shrinks text only when even those overflow. */
const MANDATORY_NOTES = 2;
function pickNotes(p){ return noteCandidates(p); }

function fitNotes(){
  $$('.view.active .call-sheet .player-row').forEach(row=>{
    const cell = row.querySelector('.notes-cell');
    const lis = [...cell.querySelectorAll('li')];
    lis.forEach(li=> li.hidden = false);
    for(let i = lis.length-1; i >= MANDATORY_NOTES && cell.scrollHeight > cell.clientHeight + 0.5; i--) lis[i].hidden = true;
  });
}

function playerRow(p){
    /* first-name phonetic sits beside the first name; surname phonetic leads the subline under the surname */
    const first = p.sayFirst ? `${p.firstName} <span class="say">(${p.sayFirst})</span>` : p.firstName;
    /* goalies show their catching hand, skaters their shooting hand — never "Shoots" for a goalie */
    const hand = p.position==='G' ? (p.catches ? "Catches "+p.catches : null) : (p.shoots ? "Shoots "+p.shoots : null);
    /* quick-ID line: FIRST NAME (larger) · line / special-teams slots · height · class · hand.
       The F/D letter is implied by F1 / D1 / 7D, so it only shows for goalies or when there are no line tags. */
    const tags = lineTags(p);
    const hasPosTag = tags.some(t=>/^(F\d|D\d|7D)$/.test(t));
    const posLetter = (p.position==='G' || !hasPosTag) ? p.position : null;
    const strip = [`<span class="fn">${first}</span>`, posLetter, tags.length ? `<span class="ln">${tags.join(" · ")}</span>` : null, p.height, p.classYear, hand]
      .filter(Boolean).join(" &nbsp;·&nbsp; ");
    const sub = [p.sayLast ? `<span class="say">${p.sayLast}</span>` : null, p.hometown, p.previousTeam]
      .filter(Boolean).join(" · ");
    const notes = pickNotes(p).map(n=>`<li${n.gen?' class="gen"':''}>${n.text}</li>`).join("");
    return `<div class="player-row">
      <div class="id-cell">
        <div class="num-block${p.position==='G'?' goalie':''}">${p.number}</div>
        <div class="id-text">
          <div class="strip">${strip}</div>
          <div class="surname" data-fit>${p.lastName.toUpperCase()}</div>
          <div class="subline">${sub||"&nbsp;"}</div>
        </div>
      </div>
      <div class="notes-cell"><ul>${notes}</ul></div>
    </div>`;
}

/* call-sheet pages: one in portrait, two (rows split evenly) in landscape */
function callSheetPages(pageNo, total){
  const roster = dressedRoster();
  const out = activeRoster().filter(offLineup);
  const outTxt = out.length ? ` · NOT ON LINEUP: ${out.map(p=>p.number+" "+p.lastName.toUpperCase()).join(" · ")}` : "";
  const chunks = isLandscape() ? [roster.slice(0, Math.ceil(roster.length/2)), roster.slice(Math.ceil(roster.length/2))] : [roster];
  $('#rosterCount').textContent = `${roster.length} players on the sheet${out.length?` (${out.length} not on the coach's lineup are left off the call sheet but stay in every other view)`:""}.`;
  return chunks.map((chunk,i)=> pageShell({
    cls:"call-sheet", id:"callSheet"+(i?i+1:""),
    headRight: headRight(""),
    colA:"PLAYER / QUICK ID", colB:"BROADCAST NOTES",
    foot:[`PAGE ${pageNo+i} OF ${total} · GAME-DAY VERIFY: numbers · scratches · positions · starting goalie`,
          `HC ${TEAM.staff[0].name} &nbsp;·&nbsp; AC ${TEAM.staff[1].name}`,
          `${roster.length} DRESSED${chunks.length>1?` · ${chunk[0].number}–${chunk[chunk.length-1].number} ON THIS PAGE`:""}${outTxt}`],
    body:`<div class="cs-rows">${chunk.map(playerRow).join("")}</div>`
  })).join("");
}

/* per-surname shrink so ZAHORCHAK / CABECEIRAS never wrap or clip.
   Max size follows --scale; min is a hard floor for legibility. */
function fitAllNames(){
  const scale = parseFloat(getComputedStyle($('.call-sheet')||document.body).getPropertyValue('--scale')) || 1;
  const shrink = (els, max, min, step) => els.forEach(el=>{
    let size = max;
    el.style.fontSize = size+"px";
    while(el.scrollWidth > el.clientWidth && size > min){
      size -= step;
      el.style.fontSize = size+"px";
    }
  });
  shrink($$('.view.active .surname[data-fit]'), 16 * scale, 9.5, 0.5);
  /* the quick-ID strip (position · line tags · first name · height · class · hand) shrinks a little rather than truncating */
  shrink($$('.view.active .strip'), 7.2 * scale, 6, 0.2);
}


/* one lines-grid renderer for both teams: `resolve(key)` turns a line-chart key into a name, or
   falsy for an empty slot. Alabama keys are sweater numbers; Bandits keys are OPPONENT ids.
   filled = lines exist (compact, typed); blank = write-in boxes. blankRows adds wide write-in rows. */
const lineRow = (lbl, cells) => `<div class="line"><div class="lbl">${lbl}</div>${cells}</div>`;
const lineHdr = cols => `<div class="line hdr"><div class="lbl"></div>${cols.map(c=>`<div class="slot">${c}</div>`).join("")}</div>`;
const lineAt = (L, group, i, j) => L && L[group] && L[group][i] ? L[group][i][j] : null;
function linesGrid(L, resolve, {blankRows=null}={}){
  const filled = !!(L && L.forwards);
  const labeled = !L || L.columnsLabeled !== false;
  const slot = (key, cls="") => `<div class="slot ${cls}">${(key!=null && resolve(key)) || "&nbsp;"}</div>`;
  const extra = filled && L.extraDefense && L.extraDefense.length
    ? lineRow("7D", L.extraDefense.map(k=>slot(k)).join("") + `<div class="slot blank"></div>`.repeat(Math.max(0, 3-L.extraDefense.length))) : "";
  const blanks = blankRows || (filled ? [] : ["PP1","PK1"]);
  return `<div class="lines${filled?" sm":""}">
    ${lineHdr(labeled ? ["LW","C","RW"] : ["","",""])}
    ${[0,1,2,3].map(i=> lineRow("F"+(i+1), [0,1,2].map(j=> slot(lineAt(L,'forwards',i,j))).join(""))).join("")}
    ${lineHdr(labeled ? ["LD","RD","G"] : ["","","G"])}
    ${[0,1,2].map(i=> lineRow("D"+(i+1), [0,1].map(j=> slot(lineAt(L,'defense',i,j))).join("") +
        (i<2 ? slot(L && L.goalies ? L.goalies[i] : null) : `<div class="slot blank"></div>`))).join("")}
    ${extra}
    ${blanks.map(l=> lineRow(l, `<div class="slot wide">&nbsp;</div>`)).join("")}
  </div>`;
}

/* ============================================================
   TEAM SHEET — page 2. Program facts, staff, history, leadership,
   phonetics, lines grid, goalies, roster breakdown, game-day verify.
   Everything is TEAM data or computed from ROSTER; nothing typed in.
   ============================================================ */
function teamSheetPages(pageNo, total){
  const r = activeRoster();
  const sec  = (title, body) => `<div class="ts-sec"><h3>${title}</h3>${body}</div>`;
  const fill = title => `<div class="ts-sec fill"><h3>${title}</h3><div class="rule"></div></div>`;
  const ul  = arr => `<ul>${arr.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  const kv  = rows => `<div class="ts-kv">${rows.map(([k,v])=>`<b>${k}</b><span>${v}</span>`).join("")}</div>`;
  const tag = p => `<b>${p.number}</b> ${p.lastName.toUpperCase()}`;
  const tally = (list, key) => list.reduce((m,p)=>{ const v = key(p); if(v) m[v]=(m[v]||0)+1; return m; }, {});
  const tallyStr = m => Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${v}`).join(" · ");

  /* ---- left column ---- */
  const program = kv([
    ["Conference", TEAM.conference],
    ["League", TEAM.league],
    ["Home rink", TEAM.homeRink],
    ["Practice", TEAM.practice]
  ]);
  const staff = kv(TEAM.staff.map(s=>[s.role, `${s.name} <i>· ${s.from}</i>`]));   /* staff notes live in Storylines + Learn the Roster */
  const history = ul(TEAM.history);

  /* TONIGHT'S GAME — fundraiser exhibition; stored in TEAM.game, never in seasons */
  const G = TEAM.game;
  const tonight = G ? `<div class="tonight">
      <div class="t1">${G.label}</div>
      <div class="t2">Alabama Women's Hockey vs ${G.opponent}${G.opponentNote?` — ${G.opponentNote}`:""}</div>
      <div class="t3">${G.purpose||""}</div>
      <div class="t3">${G.countsNote||""}</div>
    </div>` : "";

  /* BY THE NUMBERS — every figure derived from TEAM.seasons / TEAM.recordBook / TEAM.standings2526 */
  const ABBR = {"South Carolina":"USC","High Point":"HPU"};
  const short = o => ABBR[o] || o;
  const ord = n => n + (["th","st","nd","rd"][(n%100>10&&n%100<14)?0:Math.min(n%10,4)] || "th");
  const dash = s => s.replace("-","–");
  const pm = n => (n>=0?"+":"")+n;
  const endYear = s => +s.season.split("-")[0] + 1;
  const seasonLine = s => {
    const m = seasonSummary(s); if(!m.gp) return null;
    const po = s.games.filter(g=>g.type==='playoff' && g.result);
    const chs = s.chs==='champion' ? `CHS CHAMPION` : s.chs==='finalist' ? `CHS FINALIST` : null;
    const run = po.length ? ` (${po.map(g=>`${g.result} ${g.gf}–${g.ga} ${short(g.opp)}`).join(" · ")})` : "";
    return `${dash(s.season)}${s.complete?"":" supplied results"} · ${m.w}–${m.l} · ${m.gf} GF · ${m.ga} GA · ${pm(m.diff)}${chs?` · ${chs}${run}`:""}`;
  };
  const agg = aggregateSummary();
  const seasonsSpan = TEAM.seasons.length ? `${TEAM.seasons[0].season.split("-")[0]}–${String(endYear(TEAM.seasons[TEAM.seasons.length-1])).slice(2)}` : "";
  const h2h = headToHead();
  const auburn = h2h.find(h=>h.opp==="Auburn");
  const restH2H = h2h.filter(h=>h!==auburn && h.gp>=2).map(h=>`${short(h.opp)} ${h.w}–${h.l}${h.l===0?` (${h.gf}–${h.ga})`:""}`);
  const st = TEAM.standings2526;
  const rb = TEAM.recordBook;
  const onRoster = name => r.find(p=>fullName(p)===name);
  const lead = rb && rb.points.find(e=>e.rank===1);
  const leadPpg = lead && rb.ppg.find(e=>e.name===lead.name);
  /* returning scorers: Alabama career points, current roster only (derived from season rows) */
  const scorers = r.map(p=>({p, t:getAlabamaSkaterTotals(p)})).filter(x=>x.t && x.t.p>0)
    .sort((a,b)=>b.t.p-a.t.p || b.t.g-a.t.g).slice(0,6);
  const s2425full = TEAM.seasons.find(s=>s.season==="2024-25" && s.complete);
  const s25 = s2425full ? seasonSummary(s2425full) : null;
  const bestWin = allCountingGames().filter(g=>g.result==='W').sort((a,b)=>(b.gf-b.ga)-(a.gf-a.ga))[0];
  const numbers = [
    ...TEAM.seasons.filter(s=>s.season!=="2023-24").map(seasonLine),
    agg.gp ? `${agg.gp} supplied competitive games ${seasonsSpan} · ${agg.w}–${agg.l} · ${agg.gf}–${agg.ga} · ${pm(agg.diff)} · one-goal games ${agg.oneGoal.w}–${agg.oneGoal.l}` : null,
    s25 && s25.gp ? `${dash(s2425full.season)} averaged ${(s25.gf/s25.gp).toFixed(1)} GF / ${(s25.ga/s25.gp).toFixed(1)} GA per game${bestWin?` · biggest supplied win ${bestWin.gf}–${bestWin.ga} vs ${bestWin.opp}${bestWin.when?` (${bestWin.when})`:""}`:""}` : null,
    scorers.length ? `Returning scorers (Alabama career P) · ${scorers.map(x=>`${x.p.lastName} ${x.t.p}`).join(" · ")}` : null,
    auburn ? `<b>VS AUBURN · ${auburn.w}–${auburn.l}</b> · Alabama has outscored Auburn ${auburn.gf}–${auburn.ga} in supplied results` : null,
    restH2H.length ? `vs ${restH2H.join(" · ")}` : null,
    st ? `${dash(st.label)} EP snapshot · listed ${ord(st.position)} · ${st.gp} GP · ${st.points} pts` : null,
    lead ? `${surnameOf(lead.name)} · EP program leader: ${lead.p} P · ${lead.g} G${leadPpg?` · ${leadPpg.ppg.toFixed(2)} P/GP`:""}` : null
  ].filter(Boolean);
  const byNumbers = ul(numbers) + (TEAM.careerLegend ? `<div class="ts-legend">${TEAM.careerLegend}</div>` : "");
  const leaders = r.filter(p=>p.leadership && p.leadership.length)
    .map(p=>`${tag(p)} — ${p.leadership.join(" · ")}`);

  /* ---- right column ---- */
  const L = TEAM.lines || null;
  const byNum = n => r.find(p=>p.number===n);
  const alaName = n => { const p = byNum(n); return p && tag(p); };
  const names = keys => (keys||[]).map(alaName).filter(Boolean).join(" · ");
  const lines = linesGrid(L, alaName)
    + (L && L.notListed && L.notListed.length ? `<div class="ts-legend"><b>Not on the coach's sheet:</b> ${names(L.notListed)} — ${L.notListedNote||"verify"}</div>` : "");
  const special = L && (L.pp || L.pk) ? kv([
    ...(L.pp||[]).map((u,i)=>["PP"+(i+1), names(u)]),
    ...(L.pk||[]).map((u,i)=>["PK"+(i+1), names(u)])
  ]) : "";
  const goalies = r.filter(p=>p.position==='G');
  const goalieRows = ul(goalies.map(p=>{
    const t = lineTags(p).filter(x=>/START|BACKUP|SCRATCHED|NOT ON/.test(x));
    const stat = generatedStatNote(p);
    return `${tag(p)}${t.length?` <span class="ln">${t.join(" · ")}</span>`:""} · ${p.classYear}${p.yearsPlaying?` · ${p.yearsPlaying} yrs hockey`:""}${p.hometown?` · ${p.hometown}`:""}${stat?` · <b>${stat}</b>`:""}`;
  }));

  /* ---- AUDIT EXTRAS — every line below is computed from ROSTER / TEAM, nothing typed ---- */
  const dressed = dressedRoster();
  const iso = TEAM.game && TEAM.game.isoDate;
  const skT = p => getAlabamaSkaterTotals(p) || {p:0, g:0, pim:0, gp:0};
  const unitPlayers = keys => (keys||[]).filter(k=>k!=null).map(byNum).filter(Boolean);
  const unitSum = (keys, f) => unitPlayers(keys).reduce((a,p)=>a+f(skT(p)),0);
  const unitLbl = keys => unitPlayers(keys).map(p=>`${p.lastName} ${skT(p).p}`).join(" · ");
  const totG = dressed.reduce((a,p)=>a+skT(p).g,0), totP = dressed.reduce((a,p)=>a+skT(p).p,0);
  const prodRows = L ? [
    ...(L.forwards||[]).map((row,i)=>["F"+(i+1), row]),
    ...(L.defense||[]).map((row,i)=>["D"+(i+1), row]),
    ...(L.pp||[]).map((u,i)=>["PP"+(i+1), u])
  ].filter(([,keys])=>unitPlayers(keys).length) : [];
  const production = !prodRows.length ? "" : kv(prodRows.map(([lbl,keys])=>{
    const P = unitSum(keys,t=>t.p), G = unitSum(keys,t=>t.g);
    return [lbl, `<b>${P} P · ${G} G</b>${/^[FD]/.test(lbl) ? ` · ${unitLbl(keys)}` : totP ? ` · ${Math.round(100*P/totP)}% of dressed career points` : ""}`];
  })) + (L && L.forwards && totG ? `<div class="ts-legend">Dressed skaters' Alabama career totals: ${totG} G · ${totP} P · F1 has ${Math.round(100*unitSum(L.forwards[0],t=>t.g)/totG)}% of the goals.</div>` : "");

  /* storylines */
  const hc = TEAM.staff.find(s=>/head coach/i.test(s.role));
  const lastSeason = TEAM.seasons[TEAM.seasons.length-1];
  const lastGame = lastSeason && [...lastSeason.games].reverse().find(g=>g.counts && g.result);
  const carson = r.find(p=>fullName(p)===(lead&&lead.name));
  const cT = carson && skT(carson);
  const unbeaten = h2h.filter(h=>h.l===0 && h.gp>=3);
  const debuts = dressed.filter(p=>!p.alabamaStats);
  const bdays = dressed.map(p=>({p, d:daysToBirthday(p.dob, iso), age:ageOn(p.dob, iso)})).filter(x=>x.d!=null && x.d<=14).sort((a,b)=>a.d-b.d);
  const storylines = [
    [hc && hc.note ? `${hc.name}'s ${hc.note.replace(/^first year as/,"first season as")}` : null,
     /W2/.test(TEAM.league) ? `Alabama's first season in ACHA W2 after moving up from ACDC` : null].filter(Boolean).join(" · ") || null,
    lastGame ? `Last competitive game: ${lastGame.note||"regular season"} · ${lastGame.result} ${lastGame.gf}–${lastGame.ga} ${lastGame.opp} (${dash(lastSeason.season)}) — first look at the team since` : null,
    cT ? `${carson.lastName} enters the season ${50-cT.g>0?`${50-cT.g} G from 50`:""}${100-cT.p>0?` and ${100-cT.p} P from 100`:""} for her Alabama career (counting games only — tonight is an exhibition)` : null,
    unbeaten.length ? `Unbeaten vs ${unbeaten.map(h=>short(h.opp)).join(" and ")} in supplied results: ${unbeaten.reduce((a,h)=>a+h.w,0)}–0, outscoring them ${unbeaten.reduce((a,h)=>a+h.gf,0)}–${unbeaten.reduce((a,h)=>a+h.ga,0)}` : null,
    debuts.length ? `${debuts.length} of ${dressed.length} dressed have never played an Alabama game: ${debuts.map(p=>`${p.number} ${p.lastName}${p.position==='G'?" (in goal)":""}`).join(" · ")}` : null,
    bdays.length ? `Birthday watch: ${bdays.map(x=>`${x.p.lastName} turns ${x.age+1} ${x.d===0?"today":x.d===1?"tomorrow":`in ${x.d} days`}`).join(" · ")}${bdays.length>1 && new Set(bdays.map(x=>x.d)).size===1 ? " — same day" : ""}` : null
  ].filter(Boolean);

  /* roster notes: ages, heights, health-care track, PIM */
  const aged = dressed.map(p=>({p, a: ageOn(p.dob, iso) ?? p.age ?? null})).filter(x=>x.a!=null);
  const maxA = Math.max(...aged.map(x=>x.a)), minA = Math.min(...aged.map(x=>x.a));
  const avgA = aged.length ? (aged.reduce((a,x)=>a+x.a,0)/aged.length).toFixed(1) : null;
  const hts = dressed.map(p=>({p, h:heightIn(p.height)})).filter(x=>x.h);
  const maxH = hts.length && hts.reduce((a,x)=>x.h>a.h?x:a), minH = hts.length && hts.reduce((a,x)=>x.h<a.h?x:a);
  const avgH = hts.length ? hts.reduce((a,x)=>a+x.h,0)/hts.length : null;
  const care = dressed.filter(p=>/nurs|physician|therap|pre-med|medic/i.test(`${p.academics&&p.academics.major||""} ${p.academics&&p.academics.careerGoal||""}`));
  const careLbl = p => { const g = p.academics.careerGoal, m = p.academics.major; return (g ? g : m).replace("Pediatric physical therapist","pediatric PT").replace("Physician Assistant","PA").replace("Nurse practitioner","NP").replace("Nursing","nursing").replace("Physician","physician"); };
  const pimTop = dressed.filter(p=>skT(p).pim>0).sort((a,b)=>skT(b).pim-skT(a).pim).slice(0,5);
  const rosterNotes = [
    aged.length ? `Ages: oldest ${aged.filter(x=>x.a===maxA).map(x=>`${x.p.lastName} ${maxA}`).join(", ")} · youngest ${minA} (${aged.filter(x=>x.a===minA).map(x=>x.p.lastName).join(", ")}) · avg ${avgA}` : null,
    hts.length ? `Heights: ${maxH.p.lastName} ${maxH.p.height} tallest · ${minH.p.lastName} ${minH.p.height} shortest · avg ${inToHeight(avgH)}` : null,
    care.length ? `Health-care bound (${care.length} of ${dressed.length}): ${care.map(p=>`${p.lastName} ${careLbl(p)}`).join(" · ")}` : null
  ].filter(Boolean);
  const pimLine = pimTop.length ? `<div class="ts-legend">Career PIM: ${pimTop.map(p=>`${p.lastName} ${skT(p).pim}`).join(" · ")}</div>` : "";
  /* dressed breakdown for tonight */
  const dPos = tally(dressed, p=>({F:"F",D:"D",G:"G"})[p.position]);

  const pos = tally(r, p=>({F:"Forwards",D:"Defense",G:"Goalies"})[p.position]);
  const cls = tally(r, p=>({Fr:"Fr",So:"So",Jr:"Jr",Sr:"Sr",Gr:"Grad"})[p.classYear]);
  const states = tally(r, p=> p.hometown ? p.hometown.split(",").pop().trim() : null);
  const breakdown = kv([
    ["Tonight", `${dressed.length} dressed · ${tallyStr(dPos)}${r.length!==dressed.length?` · ${r.length-dressed.length} not on the coach's sheet`:""}`],
    ["Roster", `${r.length} players · ${tallyStr(pos)}`],
    ["Classes", tallyStr(cls)],
    ["Home states", tallyStr(states) + (r.some(p=>!p.hometown) ? ` · ${r.filter(p=>!p.hometown).length} not listed` : "")]
  ]);

  const S = {   /* every section, ready to place */
    tonight: tonight ? sec("TONIGHT'S GAME", tonight) : "",
    program: sec("PROGRAM", program), staff: sec("STAFF", staff), history: sec("HISTORY", history),
    numbers: sec("BY THE NUMBERS", byNumbers), leadership: sec("LEADERSHIP", ul(leaders)),
    notes: rosterNotes.length ? sec("ROSTER NOTES", ul(rosterNotes)) : "",
    lines: sec(L ? `LINES — ${L.source}` : "LINES — fill in at the rink", lines),
    special: special ? sec("POWER PLAY · PENALTY KILL", special) : "",
    goalies: sec("GOALIES", goalieRows),
    storylines: storylines.length ? sec("STORYLINES", ul(storylines)) : "",
    production: production ? sec("LINE PRODUCTION — Alabama career P · G by unit", production + pimLine) : "",
    breakdown: sec("ROSTER BREAKDOWN", breakdown)
  };
  const col = (...parts) => `<div class="ts-col">${parts.join("")}</div>`;
  const body = (a,b) => `<div class="ts-body">${a}${b}</div>`;
  const foot = (n, label) => [`PAGE ${n} OF ${total} · ${label}`, staffFoot(), "CHS = College Hockey South (conference)"];
  if(!isLandscape()){
    return pageShell({cls:"team-sheet", id:"teamSheet", headRight: headRight("TEAM SHEET"),
      colA:"TONIGHT · PROGRAM · HISTORY · NUMBERS · ROSTER NOTES", colB:"LINES · PP · PK · GOALIES · STORYLINES · PRODUCTION · BREAKDOWN",
      foot: foot(pageNo, "TEAM SHEET"),
      body: body(col(S.tonight, S.program, S.staff, S.history, S.numbers, S.leadership, S.notes, fill("GAME NOTES")),
                 col(S.lines, S.special, S.goalies, S.storylines, S.production, S.breakdown, fill("GAME NOTES · SCORING · PENALTIES")))});
  }
  return pageShell({cls:"team-sheet", id:"teamSheet", headRight: headRight("TEAM SHEET · PROGRAM"),
      colA:"TONIGHT · PROGRAM · STAFF · HISTORY", colB:"BY THE NUMBERS · LEADERSHIP · ROSTER NOTES",
      foot: foot(pageNo, "TEAM SHEET · PROGRAM"),
      body: body(col(S.tonight, S.program, S.staff, S.history, fill("GAME NOTES")),
                 col(S.numbers, S.leadership, S.notes, fill("GAME NOTES")))})
   + pageShell({cls:"team-sheet", id:"teamSheet2", headRight: headRight("TEAM SHEET · LINEUP"),
      colA:"LINES · PP · PK · GOALIES", colB:"STORYLINES · PRODUCTION · BREAKDOWN",
      foot: foot(pageNo+1, "TEAM SHEET · LINEUP"),
      body: body(col(S.lines, S.special, S.goalies, fill("GAME NOTES")),
                 col(S.storylines, S.production, S.breakdown, fill("SCORING · PENALTIES")))});
}

/* ============================================================
   BANDITS PACKET — names only (no numbers or stats were supplied).
   Page 1: roster rows with a blank number box, first + last name,
   line slot from the Bandits app, ruled notes. Page 2: their lines
   grid with blank PP / PK write-ins, plus ruled notes. Landscape
   splits the roster in two and gives notes a page of their own.
   ============================================================ */
function banditRow(b){
  /* names only — positions and line slots are left off the print because they can change before puck drop */
  const last = b.lastName || b.firstName;
  const first = b.lastName ? b.firstName : "";
  return `<div class="player-row">
    <div class="id-cell">
      <div class="num-block blank"></div>
      <div class="id-text">
        <div class="strip">${first ? `<span class="fn">${first}</span>` : "&nbsp;"}</div>
        <div class="surname" data-fit>${last.toUpperCase()}</div>
        <div class="subline">${b.note || "&nbsp;"}</div>
      </div>
    </div>
    <div class="notes-cell rule"></div>
  </div>`;
}
/* extra rows to write a late addition in at the rink */
const blankBanditRow = () => `<div class="player-row">
    <div class="id-cell">
      <div class="num-block blank"></div>
      <div class="id-text"><div class="strip">&nbsp;</div><div class="surname write">&nbsp;</div><div class="subline">&nbsp;</div></div>
    </div>
    <div class="notes-cell rule"></div>
  </div>`;
function banditsPages(){
  const O = typeof OPPONENT !== "undefined" ? OPPONENT : null; if(!O) return "";
  const roster = [...O.roster].sort((a,b)=>(a.lastName||a.firstName).localeCompare(b.lastName||b.firstName));
  const rows = [...roster.map(banditRow), ...Array.from({length: O.blankRows||0}, blankBanditRow)];
  const land = isLandscape(), total = land ? 4 : 2;
  const chunks = land ? [rows.slice(0, Math.ceil(rows.length/2)), rows.slice(Math.ceil(rows.length/2))] : [rows];
  const nameAt = i => { const b = roster[Math.min(i, roster.length-1)]; return (b.lastName||b.firstName).toUpperCase(); };
  const head = prefix => `<span>${prefix?prefix+" &nbsp;·&nbsp; ":""}${O.name.toUpperCase()}&nbsp;<em>at</em>&nbsp;ALABAMA &nbsp;·&nbsp; ${TEAM.game.date}${prefix?"":" &nbsp;·&nbsp; "+TEAM.game.time}</span><small>${O.note.toUpperCase()} · ${TEAM.game.label} · FILL IN NUMBERS AT THE RINK</small>`;
  const foot = (n, label) => [`PAGE ${n} OF ${total} · ${label}`, `Source: ${O.source}`, `${roster.length} NAMES + ${O.blankRows||0} BLANK · NO NUMBERS OR STATS SUPPLIED · POSITIONS / LINES: FILL IN AT THE RINK`];
  let off = 0;
  const pages = chunks.map((chunk,i)=>{ const first = off, last = off + chunk.length - 1; off += chunk.length;
    return pageShell({cls:"call-sheet opp", id:"oppSheet"+(i?i+1:""), headLeft: O.name.toUpperCase(), headRight: head(""),
    colA:"# (WRITE IN) / PLAYER", colB:"NOTES",
    foot: foot(1+i, "BANDITS ROSTER" + (chunks.length>1 ? ` · ${nameAt(first)}–${last < roster.length ? nameAt(last) : "BLANK"}` : "")),
    body:`<div class="cs-rows">${chunk.join("")}</div>`}); });
  const name = id => { const b = O.roster.find(x=>x.id===id); return b && (b.lastName ? `<b>${b.lastName.toUpperCase()}</b> ${b.firstName}` : `<b>${b.firstName.toUpperCase()}</b>`); };
  const sec = (t, body) => `<div class="ts-sec"><h3>${t}</h3>${body}</div>`;
  const fill = t => `<div class="ts-sec fill"><h3>${t}</h3><div class="rule"></div></div>`;
  const col = (...parts) => `<div class="ts-col">${parts.join("")}</div>`;
  /* lines can change before the game — the grid prints blank to write in at the rink (their app's lines stay in Broadcast Mode) */
  const grid = linesGrid(null, name, {blankRows:["PP1","PP2","PK1","PK2"]});
  const goalies = `<div class="lines"><div class="line"><div class="lbl">START</div><div class="slot">&nbsp;</div><div class="slot">&nbsp;</div></div>
    <div class="line"><div class="lbl">BACKUP</div><div class="slot">&nbsp;</div><div class="slot">&nbsp;</div></div></div>`;
  const linesPage = n => pageShell({cls:"team-sheet opp", id:"oppTeam", headLeft: O.name.toUpperCase(), headRight: head("LINES"),
    colA:"LINES · PP · PK · GOALIES", colB:"GAME NOTES · SCORING · PENALTIES", foot: foot(n, "BANDITS LINES"),
    body:`<div class="ts-body">${col(sec(`LINES — fill in at the rink`, grid), sec("GOALIES", goalies), fill("GAME NOTES"))}${col(fill("GAME NOTES · SCORING · PENALTIES"))}</div>`});
  const notesPage = n => pageShell({cls:"team-sheet opp", id:"oppNotes", headLeft: O.name.toUpperCase(), headRight: head("NOTES"),
    colA:"GAME NOTES", colB:"SCORING · PENALTIES", foot: foot(n, "BANDITS NOTES"),
    body:`<div class="ts-body">${col(fill("GAME NOTES"))}${col(fill("SCORING · PENALTIES"))}</div>`});
  return pages.join("") + (land ? linesPage(3) + notesPage(4) : linesPage(2));
}

/* build every page for the current layout */
function renderPages(){
  const total = isLandscape() ? 4 : 2;
  const callPages = isLandscape() ? 2 : 1;
  $('#pages').innerHTML = callSheetPages(1, total) + teamSheetPages(callPages+1, total);
  if($('#oppPages')) $('#oppPages').innerHTML = banditsPages();
  document.body.classList.toggle('landscape', isLandscape());
  $('#btnLayout').textContent = isLandscape() ? "LAYOUT: 4 × LANDSCAPE" : "LAYOUT: 2 × PORTRAIT";
}

/* screen preview: scale each letter page down to fit the window, never distort it.
   PREVIEW 8.5 × 11 toggles actual size (scale 1) so you see exactly what prints. */
let previewActual = false;
function scaleSheet(){
  $$('.sheet-stage').forEach(stage=>{
    const page = stage.firstElementChild;
    if(!stage.offsetWidth || !page) return;
    const land = page.classList.contains('land');
    const W = (land ? 10.64 : 8.14) * 96, H = (land ? 8.14 : 10.64) * 96;
    const avail = stage.offsetWidth - 8;
    const scale = previewActual ? 1 : Math.min(1, avail / W);
    page.style.transform = `scale(${scale})`;
    stage.style.height = (H * scale + 20) + "px";
  });
}

$('#btnPrint').onclick = ()=> { autoFit(); window.print(); };
$('#btnPreview').onclick = ()=>{
  previewActual = !previewActual;
  document.body.classList.toggle('preview', previewActual);
  $('#btnPreview').textContent = previewActual ? "FIT TO WINDOW" : "PREVIEW 8.5 × 11";
  showView('sheet');
  window.scrollTo({top:0, behavior:'smooth'});
};
$('#btnLayout').onclick = ()=>{
  LAYOUT.mode = isLandscape() ? 'portrait' : 'landscape';
  store.write('bamaLayout', LAYOUT.mode);
  renderPages(); FIT.load(); showView($('#view-bandits').classList.contains('active') ? 'bandits' : 'sheet');
  window.scrollTo({top:0, behavior:'smooth'});
};
window.addEventListener('resize', scaleSheet);
