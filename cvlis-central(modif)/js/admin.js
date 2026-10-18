/* ===== ADMIN PANEL: school head only ===== */
/* Naka-save na sa MySQL ang announcements at events (hindi na localStorage).
   Ang bawat item ay array na may id sa dulo:
   NEWS   = [month, day, title, text, tag, id]
   EVENTS = [month, day, title, place, id]
   Gumagana pa rin ang render.js dahil binabasa lang nito ang unang mga field. */

/* ---------- Load from server ---------- */
async function loadNewsEvents() {
  try {
    const news = await api("/news");
    NEWS = news.map((n) => [n.month, n.day, n.title, n.text, n.tag, n.id]);
  } catch (e) { /* gamitin ang default data kung walang server */ }
  try {
    const events = await api("/events");
    EVENTS = events.map((e) => [e.month, e.day, e.title, e.place, e.id]);
  } catch (e) {}
}

async function refreshLists() {
  await loadNewsEvents();
  renderAnnouncements();
  renderEvents();
  renderAdminAnnList();
  renderAdminEvList();
}

/* Ipakita o itago ang lahat ng admin UI (menu link, header button, panel) */
function applyAdminState(on) {
  if (on) {
    addAdminNavLink();
    const who = $("#adminWho");
    if (who && currentUser) who.textContent = currentUser.name + " · " + currentUser.email;
    renderAdminAnnList();
    renderAdminEvList();
  } else {
    removeAdminNavLink();
    const adminView = $("#admin");
    if (adminView && adminView.classList.contains("on")) go("home");
  }
}

/* ---------- Admin link in hamburger menu ---------- */
function addAdminNavLink() {
  if (!$("nav a[data-v='admin']")) {
    const nav = $("#nav");
    if (nav) {
      nav.insertAdjacentHTML("beforeend",
        '<small class="mono" id="adminNavLabel" style="margin-top:12px;color:var(--gold)">ADMIN</small>' +
        '<a data-v="admin" style="background:#ffffff0d;border:1px dashed var(--gold)">Admin Panel</a>'
      );
      const link = $("nav a[data-v='admin']");
      if (link) link.onclick = () => go("admin");
    }
  }

  if (!$("#adminHeaderBtn")) {
    const headerAuth = $(".auth");
    if (headerAuth) {
      const btn = document.createElement("button");
      btn.id = "adminHeaderBtn";
      btn.className = "out";
      btn.textContent = "Admin";
      btn.onclick = () => go("admin");
      headerAuth.insertBefore(btn, headerAuth.firstChild);
    }
  }
}

function removeAdminNavLink() {
  const link = $("nav a[data-v='admin']");
  if (link) link.remove();
  const label = $("#adminNavLabel");
  if (label) label.remove();
  const headerBtn = $("#adminHeaderBtn");
  if (headerBtn) headerBtn.remove();
}

function adminLogout() {
  logout();
}

/* ---------- Tabs ---------- */
function initAdminTabs() {
  $$(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".admin-tab").forEach((t) => t.classList.remove("on"));
      $$(".admin-tab-content").forEach((c) => c.classList.remove("on"));
      tab.classList.add("on");
      $("#tab-" + tab.dataset.tab).classList.add("on");
    });
  });
}

/* =====================================================
   ANNOUNCEMENTS
   ===================================================== */
function clearAnnForm() {
  $("#annMonth").value = "";
  $("#annDay").value = "";
  $("#annTitle").value = "";
  $("#annText").value = "";
  $("#annTag").value = "";
  $("#saveAnnBtn").dataset.editId = "";
  $("#saveAnnBtn").textContent = "Save Announcement";
}

async function saveAnnouncement() {
  const month = $("#annMonth").value.trim().toUpperCase();
  const day = $("#annDay").value.trim();
  const title = $("#annTitle").value.trim();
  const text = $("#annText").value.trim();
  const tag = $("#annTag").value.trim() || "General";

  if (!month || !day || !title || !text) {
    alert("Please fill in month, day, title, and description.");
    return;
  }
  if (month.length > 3 || day.length > 2) {
    alert("Month should be 3 letters (e.g. AUG). Day should be 1–2 digits.");
    return;
  }

  const editId = $("#saveAnnBtn").dataset.editId;
  const body = { month, day, title, text, tag };
  try {
    if (editId) await api("/news/" + editId, { method: "PUT", body });
    else await api("/news", { method: "POST", body });
  } catch (e) {
    alert(e.message);
    return;
  }

  clearAnnForm();
  await refreshLists();
  alert("Announcement saved.");
}

function editAnnouncement(index) {
  const item = NEWS[index];
  if (!item) return;
  $("#annMonth").value = item[0];
  $("#annDay").value = item[1];
  $("#annTitle").value = item[2];
  $("#annText").value = item[3];
  $("#annTag").value = item[4];
  $("#saveAnnBtn").dataset.editId = item[5];
  $("#saveAnnBtn").textContent = "Update Announcement";
  $("#annTitle").focus();
  $("#annTitle").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deleteAnnouncement(index) {
  const item = NEWS[index];
  if (!item) return;
  if (!confirm("Delete this announcement?\n\n" + item[2])) return;
  try {
    await api("/news/" + item[5], { method: "DELETE" });
  } catch (e) {
    alert(e.message);
    return;
  }
  await refreshLists();
}

function renderAdminAnnList() {
  const box = $("#annAdminList");
  if (!box) return;
  if (NEWS.length === 0) {
    box.innerHTML = '<p style="color:var(--mut)">No announcements yet. Add one above.</p>';
    return;
  }
  box.innerHTML = NEWS.map((item, i) =>
    '<div class="admin-item">' +
      '<div class="info">' +
        '<b>' + esc(item[2]) + '</b>' +
        '<small>' + esc(item[0]) + ' ' + esc(item[1]) + ' · ' + esc(item[4]) + '</small>' +
      '</div>' +
      '<div class="actions">' +
        '<button class="out" style="color:var(--ink)" onclick="editAnnouncement(' + i + ')">Edit</button>' +
        '<button class="del" onclick="deleteAnnouncement(' + i + ')">Delete</button>' +
      '</div>' +
    '</div>'
  ).join("");
}

/* =====================================================
   EVENTS
   ===================================================== */
function clearEvForm() {
  $("#evMonth").value = "";
  $("#evDay").value = "";
  $("#evTitle").value = "";
  $("#evPlace").value = "";
  $("#saveEvBtn").dataset.editId = "";
  $("#saveEvBtn").textContent = "Save Event";
}

async function saveEvent() {
  const month = $("#evMonth").value.trim().toUpperCase();
  const day = $("#evDay").value.trim();
  const title = $("#evTitle").value.trim();
  const place = $("#evPlace").value.trim();

  if (!month || !day || !title || !place) {
    alert("Please fill in month, day, title, and place.");
    return;
  }
  if (month.length > 3 || day.length > 2) {
    alert("Month should be 3 letters (e.g. SEP). Day should be 1–2 digits.");
    return;
  }

  const editId = $("#saveEvBtn").dataset.editId;
  const body = { month, day, title, place };
  try {
    if (editId) await api("/events/" + editId, { method: "PUT", body });
    else await api("/events", { method: "POST", body });
  } catch (e) {
    alert(e.message);
    return;
  }

  clearEvForm();
  await refreshLists();
  alert("Event saved.");
}

function editEvent(index) {
  const item = EVENTS[index];
  if (!item) return;
  $("#evMonth").value = item[0];
  $("#evDay").value = item[1];
  $("#evTitle").value = item[2];
  $("#evPlace").value = item[3];
  $("#saveEvBtn").dataset.editId = item[4];
  $("#saveEvBtn").textContent = "Update Event";
  $("#evTitle").focus();
  $("#evTitle").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deleteEvent(index) {
  const item = EVENTS[index];
  if (!item) return;
  if (!confirm("Delete this event?\n\n" + item[2])) return;
  try {
    await api("/events/" + item[4], { method: "DELETE" });
  } catch (e) {
    alert(e.message);
    return;
  }
  await refreshLists();
}

function renderAdminEvList() {
  const box = $("#evAdminList");
  if (!box) return;
  if (EVENTS.length === 0) {
    box.innerHTML = '<p style="color:var(--mut)">No events yet. Add one above.</p>';
    return;
  }
  box.innerHTML = EVENTS.map((item, i) =>
    '<div class="admin-item">' +
      '<div class="info">' +
        '<b>' + esc(item[2]) + '</b>' +
        '<small>' + esc(item[0]) + ' ' + esc(item[1]) + ' · ' + esc(item[3]) + '</small>' +
      '</div>' +
      '<div class="actions">' +
        '<button class="out" style="color:var(--ink)" onclick="editEvent(' + i + ')">Edit</button>' +
        '<button class="del" onclick="deleteEvent(' + i + ')">Delete</button>' +
      '</div>' +
    '</div>'
  ).join("");
}

/* ---------- Init ---------- */
async function initAdmin() {
  const saveAnn = $("#saveAnnBtn");
  if (saveAnn) saveAnn.addEventListener("click", saveAnnouncement);
  const saveEv = $("#saveEvBtn");
  if (saveEv) saveEv.addEventListener("click", saveEvent);

  initAdminTabs();

  await loadNewsEvents();
  renderAnnouncements();
  renderEvents();

  // Admin UI lang kung admin ang naka-login
  applyAdminState(isAdminSession());
}
