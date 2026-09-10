
/* ============================================================
   FLASHCARDS
   ============================================================ */
let flashDeck=[], flashIdx=0, weakOnly=false;

function buildDeck(){
  const r = dressedRoster();   /* study only who is on the call sheet tonight */
  flashDeck = weakOnly
    ? r.filter(p=>{ const s=pState(p.number); return s.wrong>0 || !s.mastered; })
    : r.slice();
  if(!flashDeck.length) flashDeck = r.slice();
  // weighted shuffle: missed players surface more often
  flashDeck = flashDeck
    .map(p=>({p, k: Math.random() / (pState(p.number).wrong + 1)}))
    .sort((a,b)=>a.k-b.k).map(x=>x.p);
  flashIdx = 0;
}
function renderFlash(){
  if(!flashDeck.length) buildDeck();
  const p = flashDeck[flashIdx];
  pState(p.number).seen = true; saveProgress();
  $('#flashNum').textContent = "#"+p.number;
  $('#flashName').firstChild.nodeValue = p.firstName+" "+p.lastName;
  $('#flashMeta').innerHTML = `${p.role} · ${p.hometown||"—"}${sayLine(p)?`<br><span class="say">${sayLine(p)}</span>`:""}`;
  $('#flashBack').style.display = 'none';
  $('#flashFront').style.display = 'block';
  $('#flashPos').textContent = `Card ${flashIdx+1} of ${flashDeck.length}${weakOnly?" · weak players only":""}`;
}
function reveal(){ $('#flashBack').style.display='block'; }
function moveFlash(d){ flashIdx = (flashIdx + d + flashDeck.length) % flashDeck.length; renderFlash(); }
$('#btnReveal').onclick = reveal;
$('#btnNext').onclick = ()=>moveFlash(1);
$('#btnPrev').onclick = ()=>moveFlash(-1);
$('#btnGot').onclick = ()=>{ const s=pState(flashDeck[flashIdx].number); s.correct++; if(s.correct>=2) s.mastered=true; saveProgress(); moveFlash(1); };
$('#btnMissed').onclick = ()=>{ const s=pState(flashDeck[flashIdx].number); s.wrong++; s.mastered=false; saveProgress(); moveFlash(1); };
$('#btnWeak').onclick = e=>{ weakOnly=!weakOnly; e.target.classList.toggle('on',weakOnly); buildDeck(); renderFlash(); };
document.addEventListener('keydown', e=>{
  if(e.code==='Escape' && $('#modal').classList.contains('open')){ closeModal(); return; }
  if(!$('#view-flash').classList.contains('active')) return;
  if(e.code==='Space'){ e.preventDefault(); reveal(); }
  if(e.code==='ArrowRight') moveFlash(1);
  if(e.code==='ArrowLeft') moveFlash(-1);
});

/* ============================================================
   QUIZZES — number→name, name→number, photo ID
   ============================================================ */
let quizMode='num', qRight=0, qTotal=0, qAnswer=null;
const setMode = m => { quizMode=m;
  $('#qmNum').classList.toggle('on',m==='num');
  $('#qmName').classList.toggle('on',m==='name');
  $('#qmPhoto').classList.toggle('on',m==='photo');
  qRight=0;qTotal=0;nextQuestion(); };
$('#qmNum').onclick=()=>setMode('num');
$('#qmName').onclick=()=>setMode('name');
$('#qmPhoto').onclick=()=>setMode('photo');

function pickWeighted(list){
  const w = list.map(p=>pState(p.number).wrong+1);
  const total = w.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<list.length;i++){ r-=w[i]; if(r<=0) return list[i]; }
  return list[list.length-1];
}
function sample(arr,n,not){
  const pool = arr.filter(x=>x!==not); const out=[];
  while(out.length<n && pool.length) out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
}
function nextQuestion(){
  const r = dressedRoster();
  const anyPhotos = r.some(p=>p.photo);
  if(quizMode==='photo' && !anyPhotos){
    $('#quizPrompt').textContent = "Photo quiz unlocks once headshots are added.";
    $('#quizOpts').innerHTML = `<div class="score" style="text-align:left;">Drop headshots into <b>assets/players/alabama/</b> and set each player's <b>photo</b> field in the roster data. The quiz turns on automatically.</div>`;
    return;
  }
  const p = pickWeighted(r);
  qAnswer = p;
  const wrongs = sample(r,3,p);
  const opts = [p,...wrongs].sort(()=>Math.random()-0.5);

  if(quizMode==='num'){
    $('#quizPrompt').textContent = `Who wears #${p.number}?`;
    $('#quizOpts').innerHTML = opts.map(o=>`<button class="opt" data-n="${o.number}">${o.firstName} ${o.lastName}</button>`).join("");
  } else if(quizMode==='name'){
    $('#quizPrompt').textContent = `What number is ${p.firstName} ${p.lastName}?`;
    $('#quizOpts').innerHTML = opts.map(o=>`<button class="opt" data-n="${o.number}">#${o.number}</button>`).join("");
  } else {
    $('#quizPrompt').innerHTML = `Who is this?${photoBox(p)}`;
    $('#quizOpts').innerHTML = opts.map(o=>`<button class="opt" data-n="${o.number}">${o.firstName} ${o.lastName}</button>`).join("");
  }
  $$('#quizOpts .opt').forEach(b=> b.onclick = ()=>answer(b));
}
function answer(btn){
  const chosen = +btn.dataset.n;
  const s = pState(qAnswer.number);
  qTotal++;
  if(chosen===qAnswer.number){ qRight++; s.correct++; if(s.correct>=2) s.mastered=true; btn.classList.add('right'); }
  else{ s.wrong++; s.mastered=false; btn.classList.add('wrong');
        $$('#quizOpts .opt').forEach(b=>{ if(+b.dataset.n===qAnswer.number) b.classList.add('right'); }); }
  s.seen=true; saveProgress(); updateMastery();
  $('#quizScore').textContent = `${qRight} / ${qTotal} correct`;
  /* hold the green / red long enough to register — longer on a miss so the right answer sinks in.
     Tap any option to move on early. */
  const right = chosen===qAnswer.number;
  const timer = setTimeout(nextQuestion, right ? 1500 : 2500);
  $$('#quizOpts .opt').forEach(b=> b.onclick = ()=>{ clearTimeout(timer); nextQuestion(); });
}

