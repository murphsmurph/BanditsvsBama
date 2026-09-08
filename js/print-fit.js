/* ============================================================
   PRINT FIT
   The page is fixed at 8.14in × 10.64in and rows divide it evenly,
   so the *page* can't overflow. What can overflow is the content
   inside a row. This module:
     1. measures the worst overflow across every cell,
     2. shrinks --scale in small steps until nothing overflows,
     3. shows PASS / FAIL in the top bar,
     4. lets you nudge text bigger or smaller (TEXT − / +) and
        remembers the choice.
   ============================================================ */
const FIT = {
  user: store.read('bamaTextScale', 1.2),   // your preference (120% fits 21 rows with room)
  applied: 1.0,                              // what actually rendered
  min: 0.70, max: 1.50, step: 0.05
};

function setScale(s){
  $('#callSheet').style.setProperty('--scale', s);
  FIT.applied = s;
}

/* worst overflow (px) anywhere on the sheet */
function measureOverflow(){
  const page = $('#callSheet');
  let over = page.scrollHeight - page.clientHeight;
  $$('.player-row').forEach(row=>{
    row.querySelectorAll('.id-cell, .notes-cell').forEach(cell=>{
      over = Math.max(over, cell.scrollHeight - cell.clientHeight);
    });
    const id = row.querySelector('.id-text');
    over = Math.max(over, id.offsetHeight - row.clientHeight);
  });
  return Math.max(0, over);
}

/* start from the user's size, step down until it fits */
function autoFit(){
  let s = FIT.user;
  setScale(s); fitAllNames();
  let over = measureOverflow();
  while(over > 0.5 && s > FIT.min){
    s = +(s - 0.02).toFixed(2);
    setScale(s); fitAllNames();
    over = measureOverflow();
  }
  reportFit(over, s);
}

/* page 2 has fixed text sizes; it can only overflow if content is added */
function teamOverflow(){
  const ts = $('#teamSheet');
  if(!ts) return 0;
  let over = ts.scrollHeight - ts.clientHeight;
  $$('#teamSheet .ts-col').forEach(c=>{ over = Math.max(over, c.scrollHeight - c.clientHeight); });
  return Math.max(0, over);
}

function reportFit(over, s){
  const badge = $('#fitBadge');
  const pct = Math.round(s*100);
  const tOver = teamOverflow();
  if(over > 0.5){
    badge.className = "fit-badge fit-fail";
    badge.textContent = `PRINT FIT: FAIL — ${Math.ceil(over)}px over at ${pct}% (trim a note)`;
    console.error('CALL SHEET OVERFLOW', over);
  } else if(tOver > 0.5){
    badge.className = "fit-badge fit-fail";
    badge.textContent = `PRINT FIT: FAIL — team sheet ${Math.ceil(tOver)}px over (trim page 2)`;
    console.error('TEAM SHEET OVERFLOW', tOver);
  } else {
    badge.className = "fit-badge fit-pass";
    badge.textContent = `PRINT FIT: PASS · text ${pct}%`;
  }
  $('#textPct').textContent = Math.round(FIT.user*100) + "%";
  if(s < FIT.user) $('#textPct').textContent += ` → ${pct}%`;
}

/* ---- TEXT − / + ---- */
function nudgeText(dir){
  FIT.user = +Math.min(FIT.max, Math.max(FIT.min, FIT.user + dir*FIT.step)).toFixed(2);
  store.write('bamaTextScale', FIT.user);
  autoFit();
}
$('#btnTextDown').onclick = ()=> nudgeText(-1);
$('#btnTextUp').onclick   = ()=> nudgeText(+1);
$('#btnTextReset').onclick= ()=> { FIT.user = 1.2; store.write('bamaTextScale', 1.2); autoFit(); };

/* re-fit once web fonts land — condensed fonts are narrower than the fallback */
if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=>{ autoFit(); }); }
