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
    /* first-name phonetic sits beside the first name; surname phonetic leads the subline under the surname */
    const first = p.sayFirst ? `${p.firstName} <span class="say">(${p.sayFirst})</span>` : p.firstName;
    const strip = [p.position, first, p.height, p.classYear, p.shoots ? "Shoots "+p.shoots : null]
      .filter(Boolean).join(" &nbsp;·&nbsp; ");
    const sub = [p.sayLast ? `<span class="say">${p.sayLast}</span>` : null, p.hometown, p.previousTeam]
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

/* ============================================================
   TEAM SHEET — page 2. Program facts, staff, history, leadership,
   phonetics, lines grid, goalies, roster breakdown, game-day verify.
   Everything is TEAM data or computed from ROSTER; nothing typed in.
   ============================================================ */
function renderTeamSheet(){
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
  const staff = kv(TEAM.staff.map(s=>[s.role, `${s.name} <i>· ${s.from}</i>`]));
  const history = ul(TEAM.history);
  const leaders = r.filter(p=>p.leadership && p.leadership.length)
    .map(p=>`${tag(p)} — ${p.leadership.join(" · ")}`);
  const sayList = r.filter(p=>p.sayLast||p.sayFirst).map(p=>`<b>${p.number}</b> ${sayLine(p)}`);

  /* ---- right column ---- */
  const L = TEAM.lines || {};
  const byNum = n => r.find(p=>p.number===n);
  const slot = (n, cls="") => { const p = n && byNum(n); return `<div class="slot ${cls}">${p ? tag(p) : "&nbsp;"}</div>`; };
  const lineRow = (lbl, cells) => `<div class="line"><div class="lbl">${lbl}</div>${cells}</div>`;
  const hdr = cols => `<div class="line hdr"><div class="lbl"></div>${cols.map(c=>`<div class="slot">${c}</div>`).join("")}</div>`;
  const lines = `<div class="lines">
    ${hdr(["LW","C","RW"])}
    ${[0,1,2,3].map(i=> lineRow("F"+(i+1), [0,1,2].map(j=> slot(L.forwards && L.forwards[i] && L.forwards[i][j])).join(""))).join("")}
    ${hdr(["LD","RD",""])}
    ${[0,1,2].map(i=> lineRow("D"+(i+1), [0,1].map(j=> slot(L.defense && L.defense[i] && L.defense[i][j])).join("") + `<div class="slot blank"></div>`)).join("")}
    ${["PP1","PP2","PK1","PK2"].map(l=> lineRow(l, `<div class="slot wide">&nbsp;</div>`)).join("")}
  </div>`;
  const goalies = r.filter(p=>p.position==='G');
  const goalieRows = `<div class="lines">
    ${lineRow("START", slot(L.goalies && L.goalies[0]) + `<div class="slot wide2">&nbsp;</div>`)}
    ${lineRow("BACKUP", slot(L.goalies && L.goalies[1]) + `<div class="slot wide2">&nbsp;</div>`)}
  </div>` + ul(goalies.map(p=>`${tag(p)} · ${p.classYear}${p.yearsPlaying?` · ${p.yearsPlaying} yrs hockey`:""}${p.hometown?` · ${p.hometown}`:""}`));

  const pos = tally(r, p=>({F:"Forwards",D:"Defense",G:"Goalies"})[p.position]);
  const cls = tally(r, p=>({Fr:"Fr",So:"So",Jr:"Jr",Sr:"Sr",Gr:"Grad"})[p.classYear]);
  const states = tally(r, p=> p.hometown ? p.hometown.split(",").pop().trim() : null);
  const breakdown = kv([
    ["Skaters", `${r.length} players · ${tallyStr(pos)}`],
    ["Classes", tallyStr(cls)],
    ["Home states", tallyStr(states) + (r.some(p=>!p.hometown) ? ` · ${r.filter(p=>!p.hometown).length} not listed` : "")]
  ]);

  const verify = [
    "Numbers · scratches · positions · starting goalie",
    ...r.filter(p=>p.dataQuality).map(p=>`${tag(p)} — ${p.dataQuality.note}`)
  ];

  $('#tsBody').innerHTML = `
    <div class="ts-col">
      ${sec("PROGRAM", program)}
      ${sec("STAFF", staff)}
      ${sec("HISTORY", history)}
      ${sec("LEADERSHIP", ul(leaders))}
      ${sec("SAY IT RIGHT", ul(sayList))}
      ${fill("GAME NOTES")}
    </div>
    <div class="ts-col">
      ${sec(TEAM.lines ? "LINES" : "LINES — fill in at the rink", lines)}
      ${sec("GOALIES", goalieRows)}
      ${sec("ROSTER BREAKDOWN", breakdown)}
      ${sec("GAME-DAY VERIFY", ul(verify))}
      ${fill("SCORING · PENALTIES")}
    </div>`;
  $('#tsFoot').innerHTML = TEAM.staff.map(s=>`${s.role.replace("Head Coach","HC").replace("Assistant Coach","AC").replace("Head of Staff","HoS")} ${s.name}`).join(" &nbsp;·&nbsp; ");
}

/* screen preview: scale each letter page down to fit the window, never distort it */
function scaleSheet(){
  $$('.sheet-stage').forEach(stage=>{
    const page = stage.firstElementChild;
    if(!stage.offsetWidth || !page) return;
    const avail = stage.offsetWidth - 8;
    const natural = 8.14 * 96;
    const scale = Math.min(1, avail / natural);
    page.style.transform = `scale(${scale})`;
    stage.style.height = (10.64 * 96 * scale + 20) + "px";
  });
}

$('#btnPrint').onclick = ()=> { autoFit(); window.print(); };
$('#btnPreview').onclick = ()=>{ showView('sheet'); window.scrollTo({top:0,behavior:'smooth'}); };
window.addEventListener('resize', scaleSheet);
