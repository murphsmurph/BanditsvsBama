
/* ============================================================
   BROADCAST MODE — dark, searchable, tap-to-expand
   ============================================================ */
function renderBcast(filter=""){
  const f = filter.trim().toLowerCase();
  const list = activeRoster().filter(p=>
    !f || String(p.number).startsWith(f) ||
    p.lastName.toLowerCase().includes(f) || p.firstName.toLowerCase().includes(f));
  const G = TEAM.game;
  const card = (G && !f) ? `<div class="bcard">
      <div><b>EVENT</b>${G.label}</div>
      <div><b>OPPONENT</b>${G.opponent}${G.opponentNote?` — ${G.opponentNote}`:""}</div>
      <div><b>PURPOSE</b>${G.purpose||""}</div>
      <div><b>COUNTS?</b>${G.counts===false ? "No — exhibition. " : ""}${G.countsNote||""}</div>
    </div>` : "";
  /* opponent rows: names and line slots only — no numbers or stats were supplied */
  const O = typeof OPPONENT !== "undefined" ? OPPONENT : null;
  const oppSlot = id => {
    if(!O || !O.lines) return null;
    const F = ["LW","C","RW"], D = ["LD","RD"];
    for(let i=0;i<(O.lines.forwards||[]).length;i++){ const j=O.lines.forwards[i].indexOf(id); if(j>=0) return `F${i+1} ${F[j]}`; }
    for(let i=0;i<(O.lines.defense||[]).length;i++){ const j=O.lines.defense[i].indexOf(id); if(j>=0) return `D${i+1} ${D[j]}`; }
    const g=(O.lines.goalies||[]).indexOf(id); if(g>=0) return g===0?"G":"G2";
    return null;
  };
  const opp = O ? O.roster.filter(b=> !f || (b.lastName||"").toLowerCase().includes(f) || b.firstName.toLowerCase().includes(f) || O.shortName.toLowerCase().includes(f)) : [];
  const oppHtml = opp.length ? `<div class="bdiv">${O.name.toUpperCase()} — ${O.note} · no numbers or stats supplied</div>` + opp.map(b=>`
    <div class="row opp">
      <div class="bn opp">${b.position}</div>
      <div>
        <div class="bname">${b.lastName ? b.lastName.toUpperCase() : b.firstName.toUpperCase()}</div>
        <div class="bmeta">${b.lastName ? b.firstName+" · " : ""}${oppSlot(b.id) || "not in lines"}${b.note ? " · "+b.note : ""}</div>
      </div>
    </div>`).join("") : "";
  $('#bcastList').innerHTML = card + list.map(p=>`
    <div>
      <div class="row" data-n="${p.number}">
        <div class="bn ${p.position==='G'?'g':''}">${p.number}</div>
        <div>
          <div class="bname">${p.lastName.toUpperCase()}</div>
          <div class="bmeta">${p.firstName} · ${p.role} · ${p.classYear}${p.hometown?" · "+p.hometown:""}${sayLine(p)?" · "+sayLine(p):""}</div>
        </div>
      </div>
      <ul class="bnotes" id="bn${p.number}">
        ${noteCandidates(p).map(n=>`<li${n.gen?(n.category==='record'?' class="rb"':' class="gen"'):''}>${n.text}</li>`).join("")}
        ${dqList(p).filter(d=>d.print).map(d=>`<li class="dq">VERIFY · ${d.note}</li>`).join("")}
      </ul>
    </div>`).join("") + oppHtml;
  $$('#bcastList .row[data-n]').forEach(r=> r.onclick = ()=> $('#bn'+r.dataset.n).classList.toggle('open'));
}
$('#bcastSearch').oninput = e=> renderBcast(e.target.value);

