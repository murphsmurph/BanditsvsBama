
/* ============================================================
   LEARN THE ROSTER — grid, filters, study panel, mastery bar
   ============================================================ */
let posFilter='ALL', clsFilter='ALL';

function silhouette(p){ return `<span class="sil">${p.firstName[0]}${p.lastName[0]}</span>`; }
function photoBox(p, cls="ph"){
  return p.photo
    ? `<div class="${cls}"><img src="${p.photo}" alt="" onerror="this.parentNode.innerHTML='${p.firstName[0]}${p.lastName[0]}';this.parentNode.classList.add('sil')"></div>`
    : `<div class="${cls}">${silhouette(p)}</div>`;
}

function renderTeamCard(){
  $('#teamCard').innerHTML = `<div class="card" style="max-width:none;margin-bottom:12px;padding:12px 14px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 24px;font-size:13px;line-height:1.45;">
      <div><b>Staff</b><br>${TEAM.staff.map(x=>`${x.role}: ${x.name} (${x.from})${x.note?" · "+x.note:""}${x.bio?"<br><span style='color:#777'>"+x.bio+"</span>":""}`).join("<br>")}</div>
      <div><b>Program</b><br>${TEAM.conference}<br>${TEAM.league}<br>Home rink: ${TEAM.homeRink}</div>
      <div><b>Program history</b><br>${TEAM.history.join("<br>")}</div>
    </div></div>`;
}

function renderGrid(){
  const list = activeRoster().filter(p=>
    (posFilter==='ALL'||p.position===posFilter) &&
    (clsFilter==='ALL'||p.classYear===clsFilter));
  $('#rosterGrid').innerHTML = list.map(p=>{
    const s = pState(p.number);
    return `<button class="tile" data-num="${p.number}">
      ${photoBox(p)}
      <div class="n"><em>#${p.number}</em> ${p.lastName}</div>
      <div class="m">${p.firstName}<br>${p.role} · ${p.classYear}<br>${p.hometown||"—"}</div>
      <div class="dots">
        <span class="dot ${s.seen?'on':''}" title="seen"></span>
        <span class="dot ${s.correct>=2?'on':''}" title="quizzed right"></span>
        <span class="dot ${s.mastered?'on':''}" title="mastered"></span>
      </div>
    </button>`;
  }).join("");
  $$('#rosterGrid .tile').forEach(t=> t.onclick = ()=> openStudy(+t.dataset.num));
  updateMastery();
}

function updateMastery(){
  const r = activeRoster();
  const pts = r.reduce((a,p)=>{
    const s = pState(p.number);
    return a + (s.seen?1:0) + (s.correct>=2?1:0) + (s.mastered?1:0);
  },0);
  const pct = Math.round(100*pts/(r.length*3));
  $('#mBar').style.width = pct+"%";
  $('#mPct').textContent = pct+"%";
}

$$('[data-pos]').forEach(b=> b.onclick = ()=>{
  posFilter=b.dataset.pos; $$('[data-pos]').forEach(x=>x.classList.toggle('on',x===b)); renderGrid();
});
$$('[data-cls]').forEach(b=> b.onclick = ()=>{
  clsFilter=b.dataset.cls; $$('[data-cls]').forEach(x=>x.classList.toggle('on',x===b)); renderGrid();
});
$('#btnResetProgress').onclick = ()=>{ progress={}; saveProgress(); renderGrid(); };

function sec(title, html){ return html ? `<div class="sec"><h3>${title}</h3>${html}</div>` : ""; }
function ul(arr){ return arr && arr.length ? `<ul>${arr.map(x=>`<li>${x}</li>`).join("")}</ul>` : ""; }

/* HOCKEY STATS table: Alabama seasons + derived career row. Never an empty season row. */
function statsTable(p){
  const S = p.alabamaStats; if(!S || !S.seasons || !S.seasons.length) return "";
  const td = cells => cells.map(c=>`<td>${c==null?"—":c}</td>`).join("");
  if(S.type==='goalie'){
    const t = getAlabamaGoalieTotals(p);
    const rows = S.seasons.map(s=>`<tr>${td([s.season, s.league, s.gp, `${s.w}–${s.l}–${s.t}`, s.gaa!=null?s.gaa.toFixed(2):null, s.svPct!=null?s.svPct.toFixed(3).replace(/^0/,""):null, s.so])}</tr>`).join("");
    return `<table class="stat-table"><tr><th>Season</th><th>League</th><th>GP</th><th>W–L–T</th><th>GAA</th><th>SV%</th><th>SO</th></tr>${rows}
      <tr class="total">${td(["Alabama career", "", t.gp, `${t.w}–${t.l}–${t.t}`, t.gaa!=null?t.gaa.toFixed(2):null, t.svPct!=null?t.svPct.toFixed(3).replace(/^0/,""):null, t.so])}</tr></table>
      <div class="src">${t.svPct==null ? "Career SV% not shown: a season is missing saves. " : ""}Source: ${S.source}.</div>`;
  }
  const t = getAlabamaSkaterTotals(p);
  const rows = S.seasons.map(s=>`<tr>${td([s.season, s.league, s.gp, s.g, s.a, s.p, s.pim])}</tr>`).join("");
  return `<table class="stat-table"><tr><th>Season</th><th>League</th><th>GP</th><th>G</th><th>A</th><th>P</th><th>PIM</th></tr>${rows}
    <tr class="total">${td(["Alabama career", t.ppg!=null?`${t.ppg.toFixed(2)} P/GP`:"", t.gp, t.g, t.a, t.p, t.pim])}</tr></table>
    <div class="src">Source: ${S.source}.</div>`;
}

function openStudy(num){
  const p = ROSTER.find(x=>x.number===num);
  pState(num).seen = true; saveProgress();
  const hooks = noteCandidates(p).filter(n=>!n.gen).map(n=>n.text);
  const age = ageOn(p.dob, TEAM.game && TEAM.game.isoDate);
  const statLine = generatedStatNote(p);
  const rbLine = recordBookLine(p);
  const dq = dqList(p);
  const isG = p.position==='G';
  $('#modalCard').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
      <div>
        <h2><em>#${p.number}</em> ${p.firstName} ${p.lastName}</h2>
        <div class="sub">${p.role} · ${p.classYear}${p.height?" · "+p.height:""}${p.hometown?" · "+p.hometown:""}${sayLine(p)?` · <span class="say">${sayLine(p)}</span>`:""}</div>
      </div>
      <button class="chip" id="closeModal">CLOSE</button>
    </div>
    ${photoBox(p,"ph")}
    ${sec("Identity", `<div class="kv">
      <b>Position</b><span>${p.role} (${p.position})</span>
      <b>Class</b><span>${p.classYear}</span>
      <b>Height</b><span>${p.height||"—"}</span>
      <b>Weight</b><span>${p.weight||"—"}</span>
      <b>${isG?"Catches":"Shoots"}</b><span>${(isG?p.catches:p.shoots)||"—"}</span>
      <b>Hometown</b><span>${p.hometown||"—"}</span>
      <b>Born</b><span>${p.dob||"—"}${age!=null?` (${age} on game day)`:""}</span>
      <b>Say it</b><span>${sayLine(p)||"as spelled"}</span>
    </div>`)}
    ${sec("Hockey", `<div class="kv">
      <b>Previous team</b><span>${p.previousTeam||"—"}</span>
      <b>Years playing</b><span>${p.yearsPlaying||"—"}</span>
    </div>${ul(p.bio)}`)}
    ${sec("Hockey stats", statsTable(p) ? `${statLine?`<div class="statline">${statLine}</div>`:""}${statsTable(p)}${rbLine?`<div class="src">${rbLine}</div>`:""}` : "")}
    ${sec("School", (p.academics&&(p.academics.major||p.academics.careerGoal)) ? `<div class="kv">
      <b>Major</b><span>${p.academics.major||"—"}</span>
      <b>Career goal</b><span>${p.academics.careerGoal||"—"}</span></div>` : "")}
    ${sec("Leadership", ul(p.leadership))}
    ${sec("Achievements", ul(p.achievements))}
    ${sec("Broadcast hooks", ul(hooks))}
    ${sec("Personality", ul(p.funFacts))}
    ${dq.map(d=>`<div class="warn${d.print?"":" soft"}"><b>${d.print?"Data conflict":"Data note"}${d.field?" · "+d.field:""}:</b> ${d.note}</div>`).join("")}
  `;
  $('#modal').classList.add('open');
  $('#closeModal').onclick = closeModal;
}
function closeModal(){ $('#modal').classList.remove('open'); renderGrid(); }
$('#modal').onclick = e=>{ if(e.target.id==='modal') closeModal(); };

