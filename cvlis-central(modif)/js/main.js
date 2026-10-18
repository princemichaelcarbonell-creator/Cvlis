/* ===== START-UP: runs once the page has loaded ===== */

(async function start() {
  renderAll();
  renderPoll();
  initNav();
  initRequest();
  await initAuth();    // tinatanong ang server kung may naka-login na
  await initAdmin();   // kinukuha ang announcements/events sa database
})();
