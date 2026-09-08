/* ============================================================
   SHARED HELPERS + STATE
   Loaded right after roster-data.js. Everything else depends on this.
   ============================================================ */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* roster sorted by sweater number — the one order every view uses */
const activeRoster = () => [...ROSTER].sort((a,b)=>a.number-b.number);

/* phonetics: sayLast is the surname, sayFirst the first name.
   sayLine(p) → "ESCOFFIER = es-co-fee-ay" / "Naomi = nay-OH-mee" / both / "" */
const sayLine = p => [
  p.sayLast  ? `${p.lastName.toUpperCase()} = ${p.sayLast}` : null,
  p.sayFirst ? `${p.firstName} = ${p.sayFirst}` : null
].filter(Boolean).join(" · ");

/* localStorage with an in-memory fallback (file:// in some browsers blocks storage) */
let mem = {};
const store = {
  read(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return mem[key] ?? fallback; } },
  write(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ mem[key] = val; } }
};

/* study progress, keyed by sweater number */
let progress = store.read('bamaStudy', {});
const pState = n => progress[n] || (progress[n] = {seen:false, correct:0, wrong:0, mastered:false});
const saveProgress = () => store.write('bamaStudy', progress);

/* ---- view switching ---- */
function showView(v){
  $$('.view').forEach(s=>s.classList.remove('active'));
  $('#view-'+v).classList.add('active');
  $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===v));
  if(v==='sheet'){ scaleSheet(); autoFit(); }
  if(v==='flash') renderFlash();
  if(v==='quiz') nextQuestion();
}
$$('.tab').forEach(t=> t.onclick = ()=> showView(t.dataset.view));
