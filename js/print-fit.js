/* ============================================================
   PRINT FIT
   Every call-sheet page is a fixed Letter box and rows divide it
   evenly, so the *page* can't overflow. What can overflow is the
   content inside a row. This module:
     1. measures the worst overflow across every cell on every page,
     2. shrinks --scale in small steps until nothing overflows,
     3. shows PASS / FAIL in the top bar,
     4. lets you nudge text bigger or smaller (TEXT − / +) and
        remembers the choice — separately for portrait and landscape.
   ============================================================ */
const FIT = {
  user: 1.2, applied: 1.0, min: 0.70, max: 1.50, step: 0.05, def: 1.2, key: 'bamaTextScale',
  /* per-layout preference: landscape rows are ~50% taller and 30% wider, so its default is bigger */
  load(){
    const land = typeof isLandscape === 'function' && isLandscape();
    this.key = land ? 'bamaTextScaleLand' : 'bamaTextScale';
    this.def = land ? 1.7 : 1.2;
    this.max = land ? 2.4 : 1.5;
    this.user = store.read(this.key, this.def);
  }
};
FIT.load();

function setScale(s){
  $$('.call-sheet:not(.opp)').forEach(pg=> pg.style.setProperty('--scale', s));   /* Bandits pages keep their CSS-pinned scale */
  FIT.applied = s;
}

/* worst overflow (px) anywhere on any call-sheet page */
function measureOverflow(){
  let over = 0;
  $$('.view.active .call-sheet').forEach(page=>{ over = Math.max(over, page.scrollHeight - page.clientHeight); });
  $$('.view.active .call-sheet .player-row').forEach(row=>{
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
  setScale(s); fitAllNames(); fitNotes();
  let over = measureOverflow();
  while(over > 0.5 && s > FIT.min){
    s = +(s - 0.02).toFixed(2);
    setScale(s); fitAllNames(); fitNotes();
    over = measureOverflow();
  }
  reportFit(over, s);
}

/* team-sheet pages have fixed text sizes; they can only overflow if content is added */
function teamOverflow(){
  let over = 0;
  $$('.view.active .team-sheet').forEach(ts=>{
    over = Math.max(over, ts.scrollHeight - ts.clientHeight);
    ts.querySelectorAll('.ts-col').forEach(c=>{ over = Math.max(over, c.scrollHeight - c.clientHeight); });
  });
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
  store.write(FIT.key, FIT.user);
  autoFit();
}
$('#btnTextDown').onclick = ()=> nudgeText(-1);
$('#btnTextUp').onclick   = ()=> nudgeText(+1);
$('#btnTextReset').onclick= ()=> { FIT.user = FIT.def; store.write(FIT.key, FIT.def); autoFit(); };

/* re-fit once web fonts land — condensed fonts are narrower than the fallback */
if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=>{ autoFit(); }); }
