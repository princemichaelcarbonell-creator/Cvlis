/* ===== NAVIGATION: side menu and page switching ===== */

function toggleMenu(open) {
  $("#nav").classList.toggle("open", open);
  $("#ov").classList.toggle("open", open);
}

function go(viewId) {
  // Admin Panel: admin lang ang pwedeng pumasok
  if (viewId === "admin" && !(typeof isAdminSession === "function" && isAdminSession())) viewId = "home";
  toggleMenu(false);
  $$(".view").forEach((v) => v.classList.toggle("on", v.id === viewId));
  $$("nav a").forEach((a) => a.classList.toggle("on", a.dataset.v === viewId));
  scrollTo(0, 0);
}

function initNav() {
  $("#burger").onclick = () => toggleMenu(!$("#nav").classList.contains("open"));
  $("#ov").onclick = () => toggleMenu(false);
  $$("nav a").forEach((a) => { a.onclick = () => go(a.dataset.v); });
  go("home");
}