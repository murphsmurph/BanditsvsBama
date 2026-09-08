/* ============================================================
   CALL SHEET RENDER
   Builds the printable page from ROSTER. print-fit.js decides
   the final text scale after this runs.
   ============================================================ */

/* highest-priority notes only; priority 3 lives in Learn the Roster */
function pickNotes(p, max){
  return [...p.notes]
    .sort((a,b)=>a.priority-b.priority)
    .filter(n=>n.priority<=2)
    .slice(0,max);
}

function renderCallSheet(){
  const roster = activeRoster();
  const rows = $('#csRows');

  /* how many bullets a row can hold depends on how tall each row will be */
  const rowsArea = 1021 - 35 - 16 - 15;             // page − header − colhead − footer (px @96dpi)
  const rowH = rowsArea / roster.length;
  const maxNotes = rowH >= 42 ? 3 : 2;

  rows.innerHTML = roster.map(p=>{
    const strip = [p.position, p.firstName, p.height, p.classYear, p.shoots ? "Shoots "+p.shoots : null]
      .filter(Boolean).join(" &nbsp;·&nbsp; ");
    const sub = [p.say ? `<span class="say">${p.say}</span>` : null, p.hometown, p.previousTeam]
      .filter(Boolean).join(" · ");
    const notes = pickNotes(p, maxNotes).map(n=>`<li>${n.text}</li>`).join("");
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
  }).join("");

  $('#footCount').textContent = roster.length + " PLAYERS";
  $('#rosterCount').textContent = roster.length + " players on the sheet.";
}

/* per-surname shrink so ZAHORCHAK / CABECEIRAS never wrap or clip.
   Max size follows --scale; min is a hard floor for legibility. */
function fitAllNames(){
  const scale = parseFloat(getComputedStyle($('#callSheet')).getPropertyValue('--scale')) || 1;
  const max = 16 * scale, min = 9.5;
  $$('.surname[data-fit]').forEach(el=>{
    let size = max;
    el.style.fontSize = size+"px";
    while(el.scrollWidth > el.clientWidth && size > min){
      size -= 0.5;
      el.style.fontSize = size+"px";
    }
  });
}

/* screen preview: scale the letter page down to fit the window, never distort it */
function scaleSheet(){
  const stage = $('.sheet-stage');
  const sheet = $('#callSheet');
  if(!stage.offsetWidth) return;
  const avail = stage.offsetWidth - 8;
  const natural = 8.14 * 96;
  const scale = Math.min(1, avail / natural);
  sheet.style.transform = `scale(${scale})`;
  stage.style.height = (10.64 * 96 * scale + 20) + "px";
}

$('#btnPrint').onclick = ()=> { autoFit(); window.print(); };
$('#btnPreview').onclick = ()=>{ showView('sheet'); window.scrollTo({top:0,behavior:'smooth'}); };
window.addEventListener('resize', scaleSheet);
