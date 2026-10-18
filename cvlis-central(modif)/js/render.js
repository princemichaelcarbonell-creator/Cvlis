/* ===== RENDER: turns the data in data.js into HTML ===== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function announcementHTML([month, day, title, text, tag]) {
  return `
    <div class="ann">
      <div class="dt"><small>${esc(month)}</small><b>${esc(day)}</b></div>
      <div class="t"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>
      <span class="tag">${esc(tag)}</span>
    </div>`;
}

function eventHTML([month, day, title, place]) {
  return `
    <div class="ev">
      <div class="dt"><b>${esc(month)}<br>${esc(day)}</b></div>
      <div><b>${esc(title)}</b><small>${esc(place)}</small></div>
    </div>`;
}

function stepHTML(text, index) {
  return `<div class="step"><i>${index + 1}</i><div>${text}</div></div>`;
}

function renderAnnouncements() {
  $$(".annList").forEach((box) => {
    box.innerHTML = NEWS.slice(0, Number(box.dataset.n)).map(announcementHTML).join("");
  });
}

function renderEvents() {
  $$(".evList").forEach((box) => { box.innerHTML = EVENTS.map(eventHTML).join(""); });
}

function renderEnrollment() {
  $$(".enr").forEach((box) => {
    box.innerHTML = `
      <h3 style="font-size:1.5rem">Enrollment, step by step</h3>
      <p>For new, transferring, and returning Grade 7–12 students at CVLIS. Enrollment is done in person at the school.</p>
      ${ENROLLMENT_STEPS.map(stepHTML).join("")}
      <button style="margin-top:14px" onclick="go('enroll')">See enrollment steps</button>`;
  });
}

function renderEnrollPage() {
  const box = $("#enrollPage");
  if (!box) return;

  const requirements = STUDENT_TYPES.map(([key, label]) => {
    const docs = ENROLL_DOCS.filter(([, , , types]) => types.length === 0 || types.includes(key));
    return `
      <div class="card" style="margin-bottom:14px">
        <h3 style="font-size:1.15rem;margin-bottom:8px">${esc(label)}</h3>
        <ul style="margin:0;padding-left:20px">
          ${docs.map(([, name, hint, types]) =>
            `<li><b>${esc(name)}</b>${types.length === 0 ? " (optional)" : ""}<br><small style="color:var(--mut)">${esc(hint)}</small></li>`
          ).join("")}
        </ul>
      </div>`;
  }).join("");

  box.innerHTML = `
    <div class="dark" style="margin-bottom:24px">
      <h3 style="font-size:1.3rem;margin-bottom:6px">Enrollment is done in person</h3>
      <p style="margin:0">Students enroll at the school's registrar office. This website does not accept online enrollment. Follow the steps below.</p>
    </div>

    <div class="card" style="margin-bottom:24px">
      <h3 style="font-size:1.3rem;margin-bottom:6px">Step-by-step procedure</h3>
      ${ENROLL_PROCEDURE.map(([title, text], i) =>
        `<div class="step"><i>${i + 1}</i><div><b>${esc(title)}</b><br><span style="color:var(--mut)">${esc(text)}</span></div></div>`
      ).join("")}
    </div>

    <h3 style="font-size:1.3rem;margin:0 0 12px">Requirements</h3>
    <p style="color:var(--mut);margin-top:0">Bring the original and a photocopy of each document.</p>
    ${requirements}

    <div class="card" style="margin:24px 0">
      <h3 style="font-size:1.15rem;margin-bottom:8px">Senior High School strands (Grade 11–12)</h3>
      <div class="chips">${SHS_STRANDS.map(([code, name]) => `<span class="tag" title="${esc(name)}">${esc(code)}</span>`).join("")}</div>
      <p style="color:var(--mut);font-size:.9rem;margin-bottom:0">${SHS_STRANDS.map(([code, name]) => `${esc(code)} – ${esc(name)}`).join(" · ")}</p>
    </div>

    <div class="card">
      <h3 style="font-size:1.15rem;margin-bottom:8px">Where and when</h3>
      <p style="margin:0 0 6px"><b>Where:</b> ${esc(ENROLL_OFFICE)}</p>
      <p style="margin:0 0 14px"><b>Office hours:</b> ${esc(ENROLL_HOURS)}</p>
      <div class="btns" style="margin-top:0">
        <button onclick="go('staff')">Staff Directory</button>
        <button class="out" style="color:var(--ink)" onclick="go('news')">See announcements</button>
      </div>
    </div>`;
}

function renderDocs() {
  $$(".docs").forEach((box) => {
    box.innerHTML = DOCS.map(([name, time]) =>
      `<div><b style="font-weight:500">${name}</b><span class="mono">${time}</span></div>`).join("");
  });
  const rDoc = $("#rDoc");
  if (rDoc) {
    rDoc.innerHTML = DOCS.map(([name]) => `<option>${name}</option>`).join("") + "<option>Other</option>";
  }
}

function renderStaff() {
  $("#staffList").innerHTML = STAFF.map(([role, office]) => `
    <div class="card">
      <h3 style="font-size:1.1rem">${role}</h3>
      <small>${office}</small><br>
      <small class="mono">Name · contact here</small>
    </div>`).join("");
}

function helpCardHTML([title, steps, view, label]) {
  return `
    <div class="card" style="margin-bottom:18px">
      <h3 style="font-size:1.3rem;margin-bottom:6px">${title}</h3>
      ${steps.map(stepHTML).join("")}
      ${view ? `<button onclick="go('${view}')">${label}</button>` : ""}
    </div>`;
}

function renderHelp() {
  if ($("#help")) return;
  $("#nav").insertAdjacentHTML("beforeend", `<a data-v="help">Help</a>`);
  const page = document.createElement("div");
  page.id = "help";
  page.className = "view";
  page.innerHTML = `
    <section class="s"><div class="wrap" style="max-width:760px">
      <div class="eyebrow mono">Help</div>
      <h2>How to use CVLIS Central</h2>
      <p style="color:var(--mut);margin-top:-10px">Step-by-step guides for everything on this website.</p>
      ${HELP.map(helpCardHTML).join("")}
    </div></section>`;
  $("#dlg").insertAdjacentElement("beforebegin", page);

  // IMPORTANT: attach click handler to the new Help link
  const helpLink = $("nav a[data-v='help']");
  if (helpLink) helpLink.onclick = () => go("help");
}

function renderAll() {
  renderAnnouncements();
  renderEvents();
  renderEnrollment();
  renderEnrollPage();
  renderDocs();
  renderStaff();
  renderHelp();
  $$(".msg").forEach((m) => { m.style.fontSize = ".9rem"; });
}