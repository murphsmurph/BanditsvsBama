
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
    </div>`).join("");
  $$('#bcastList .row').forEach(r=> r.onclick = ()=> $('#bn'+r.dataset.n).classList.toggle('open'));
}
$('#bcastSearch').oninput = e=> renderBcast(e.target.value);

