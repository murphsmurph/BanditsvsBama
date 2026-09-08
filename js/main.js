/* ============================================================
   BOOT — runs last. Order matters: data → app → views → fit.
   ============================================================ */
renderGameHeads();
renderCallSheet();
renderTeamSheet();
renderTeamCard();
renderGrid();
renderBcast();
buildDeck();
scaleSheet();
autoFit();
window.addEventListener('load', ()=>{ scaleSheet(); autoFit(); });
