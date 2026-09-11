/* ============================================================
   BOOT — runs last. Order matters: data → app → views → fit.
   ============================================================ */
renderPages();
renderTeamCard();
renderGrid();
renderBcast();
buildDeck();
scaleSheet();
autoFit();
window.addEventListener('load', ()=>{ scaleSheet(); autoFit(); });
