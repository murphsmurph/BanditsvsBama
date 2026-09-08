/* ============================================================
   BOOT — runs last. Order matters: data → app → views → fit.
   ============================================================ */
renderCallSheet();
renderTeamSheet();
renderTeamCard();
renderGrid();
renderBcast();
buildDeck();
scaleSheet();
autoFit();
window.addEventListener('load', ()=>{ scaleSheet(); autoFit(); });
