/* ============================================================
   CALL SHEET RENDER
   Builds the printable page from ROSTER. print-fit.js decides
   the final text scale after this runs.
   ============================================================ */

/* every candidate bullet is rendered; fitNotes() then hides trailing ones per row until the
   row fits at the current text size. The first MANDATORY bullets always stay (the generated
   stat line + best hook), so print-fit shrinks text only when even those overflow. */
const MANDATORY_NOTES = 2;
function pickNotes(p){ return noteCandidates(p); }

function fitNotes(){
  $$('#csRows .player-row').forEach(row=>{
    const cell = row.querySelector('.notes-cell');
    const lis = [...cell.querySelectorAll('li')];
    lis.forEach(li=> li.hidden = false);
    for(let i = lis.length-1; i >= MANDATORY_NOTES && cell.scrollHeight > cell.clientHeight + 0.5; i--) lis[i].hidden = true;
  });
}

function renderCallSheet(){
  const roster = activeRoster();
  const rows = $('#csRows');

  rows.innerHTML = roster.map(p=>{
    /* first-name phonetic sits beside the first name; surname phonetic leads the subline under the surname */
    const first = p.sayFirst ? `${p.firstName} <span class="say">(${p.sayFirst})</span>` : p.firstName;
    /* goalies show their catching hand, skaters their shooting hand — never "Shoots" for a goalie */
    const hand = p.position==='G' ? (p.catches ? "Catches "+p.catches : null) : (p.shoots ? "Shoots "+p.shoots : null);
    const strip = [p.position, first, p.height, p.classYear, hand]
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
  const staff = kv(TEAM.staff.map(s=>[s.role, `${s.name} <i>· ${s.from}${s.note?" · "+s.note:""}</i>`]));
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
  const others = rb ? rb.points.filter(e=>e.rank>1 && onRoster(e.name)).map(e=>{
    const g = rb.goals.find(x=>x.name===e.name);
    return `${surnameOf(e.name)} ${e.p} P${g && g.rank<=2 ? ` / ${e.g} G` : ""}`;
  }) : [];
  const pimTop = rb ? rb.pim.filter(e=>e.rank<=2 && onRoster(e.name)).map(e=>`${surnameOf(e.name)} ${e.pim} PIM`) : [];
  const numbers = [
    ...TEAM.seasons.filter(s=>s.season!=="2023-24").map(seasonLine),
    agg.gp ? `${agg.gp} supplied competitive games ${seasonsSpan} · ${agg.w}–${agg.l} · ${agg.gf}–${agg.ga} · ${pm(agg.diff)} · one-goal games ${agg.oneGoal.w}–${agg.oneGoal.l}` : null,
    auburn ? `<b>VS AUBURN · ${auburn.w}–${auburn.l}</b> · Alabama has outscored Auburn ${auburn.gf}–${auburn.ga} in supplied results` : null,
    restH2H.length ? `vs ${restH2H.join(" · ")}` : null,
    st ? `${dash(st.label)} EP snapshot · listed ${ord(st.position)} · ${st.gp} GP · ${st.points} pts` : null,
    lead ? `${surnameOf(lead.name)} · EP program leader: ${lead.p} P · ${lead.g} G${leadPpg?` · ${leadPpg.ppg.toFixed(2)} P/GP`:""}` : null,
    (others.length||pimTop.length) ? [...others, ...pimTop].join(" · ") : null
  ].filter(Boolean);
  const byNumbers = ul(numbers) + (TEAM.careerLegend ? `<div class="ts-legend">${TEAM.careerLegend}</div>` : "");
  const leaders = r.filter(p=>p.leadership && p.leadership.length)
    .map(p=>`${tag(p)} — ${p.leadership.join(" · ")}`);

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

  /* only game-call-important conflicts (print:true) make the printed page */
  const verify = [
    "Numbers · scratches · positions · starting goalie",
    ...r.flatMap(p=> dqList(p).filter(d=>d.print).map(d=>`${tag(p)} — ${d.note}`))
  ];

  $('#tsBody').innerHTML = `
    <div class="ts-col">
      ${tonight ? sec("TONIGHT'S GAME", tonight) : ""}
      ${sec("PROGRAM", program)}
      ${sec("STAFF", staff)}
      ${sec("HISTORY", history)}
      ${sec("BY THE NUMBERS", byNumbers)}
      ${sec("LEADERSHIP", ul(leaders))}
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

/* both page headers come from TEAM.game; page 1 carries one short descriptor, page 2 the full story */
function renderGameHeads(){
  const G = TEAM.game; if(!G) return;
  const vs = `ALABAMA&nbsp;<em>vs</em>&nbsp;${G.opponent.replace(/^HSV /,"").toUpperCase()}`;
  $('#callSheet .cs-head .r').innerHTML =
    `<span>${vs} &nbsp;·&nbsp; ${G.date} &nbsp;·&nbsp; ${G.time}</span>` +
    (G.counts===false ? `<small>${G.label} · SUPPORTING ALABAMA WOMEN'S HOCKEY · NON-COUNTING GAME</small>` : "");
  $('#teamSheet .cs-head .r').innerHTML = `<span>TEAM SHEET &nbsp;·&nbsp; ${vs} &nbsp;·&nbsp; ${G.date}</span>` +
    (G.counts===false ? `<small>${G.label} · NON-COUNTING GAME</small>` : "");
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
