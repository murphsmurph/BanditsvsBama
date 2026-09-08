
/* ============================================================
   BROADCAST MODE — dark, searchable, tap-to-expand
   ============================================================ */
function renderBcast(filter=""){
  const f = filter.trim().toLowerCase();
  const list = activeRoster().filter(p=>
    !f || String(p.number).startsWith(f) ||
    p.lastName.toLowerCase().includes(f) || p.firstName.toLowerCase().includes(f));
  $('#bcastList').innerHTML = list.map(p=>`
    <div>
      <div class="row" data-n="${p.number}">
        <div class="bn ${p.position==='G'?'g':''}">${p.number}</div>
        <div>
          <div class="bname">${p.lastName.toUpperCase()}</div>
          <div class="bmeta">${p.firstName} · ${p.role} · ${p.classYear}${p.hometown?" · "+p.hometown:""}${sayLine(p)?" · "+sayLine(p):""}</div>
        </div>
      </div>
      <ul class="bnotes" id="bn${p.number}">
        ${[...p.notes].sort((a,b)=>a.priority-b.priority).map(n=>`<li>${n.text}</li>`).join("")}
      </ul>
    </div>`).join("");
  $$('#bcastList .row').forEach(r=> r.onclick = ()=> $('#bn'+r.dataset.n).classList.toggle('open'));
}
$('#bcastSearch').oninput = e=> renderBcast(e.target.value);

