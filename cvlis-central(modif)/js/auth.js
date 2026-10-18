/* ===== AUTH: log in / sign up (gumagamit na ng server + MySQL) ===== */
/* Ang password ay hindi na dito sa browser tine-test. Ang server ang nagche-check
   at nag-iimbak ng hash sa database. Ang Admin Panel ay lalabas LANG kapag
   role = "admin" ang account. */

let authMode = "login";
let currentUser = null;

/* Tawag sa server. Nagtatapon ng Error na may mensahe kapag may problema. */
async function api(path, options = {}) {
  const res = await fetch("/api" + path, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

/* UI lang ito. Ang server pa rin ang tunay na nagbabantay sa admin actions. */
function isAdminSession() {
  return !!currentUser && currentUser.role === "admin";
}

function setAuthMode(mode) {
  authMode = mode;
  $("#nameRow").style.display = mode === "sign" ? "block" : "none";
  $("#aMsg").textContent = "";
}

function openAuth(mode) {
  setAuthMode(mode);
  $("#dlg").showModal();
}

function openA(mode) { openAuth(mode); }

function showLoggedIn(user) {
  currentUser = user;
  $("#who").textContent = "Hi, " + user.name.split(" ")[0];
  $("#loginBtn").style.display = $("#signBtn").style.display = "none";
  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "";
  if ($("#rName")) $("#rName").value = user.name;
  if ($("#rEmail")) $("#rEmail").value = user.email;
  $("#aPass").value = "";
  if ($("#dlg").open) $("#dlg").close();
}

async function logout() {
  try { await api("/logout", { method: "POST" }); } catch (e) {}
  currentUser = null;
  $("#who").textContent = "";
  $("#loginBtn").style.display = $("#signBtn").style.display = "";
  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "none";
  if ($("#rName")) $("#rName").value = "";
  if ($("#rEmail")) $("#rEmail").value = "";

  // Itago ang lahat ng admin UI at bumalik sa Home
  applyAdminState(false);
  go("home");
}

async function submitAuth() {
  const email = $("#aEmail").value.trim().toLowerCase();
  const pass = $("#aPass").value;
  const name = $("#aName").value.trim();

  if (!email || !pass || (authMode === "sign" && !name)) {
    $("#aMsg").textContent = "Please fill in all fields.";
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    $("#aMsg").textContent = "Please enter a valid email address.";
    return;
  }
  if (authMode === "sign" && pass.length < 8) {
    $("#aMsg").textContent = "Password must be at least 8 characters.";
    return;
  }

  const btn = $("#aGo");
  btn.disabled = true;
  $("#aMsg").textContent = "";
  try {
    const data = authMode === "sign"
      ? await api("/signup", { method: "POST", body: { name, email, password: pass } })
      : await api("/login", { method: "POST", body: { email, password: pass } });

    showLoggedIn(data.user);
    applyAdminState(isAdminSession());
  } catch (e) {
    $("#aMsg").textContent = e.message;
  } finally {
    btn.disabled = false;
  }
}

async function initAuth() {
  const out = document.createElement("button");
  out.className = "out";
  out.id = "logoutBtn";
  out.textContent = "Log out";
  out.style.display = "none";
  out.onclick = logout;
  $(".auth").appendChild(out);

  $("#loginBtn").onclick = () => openAuth("login");
  $("#signBtn").onclick = () => openAuth("sign");
  $("#tLogin").onclick = () => setAuthMode("login");
  $("#tSign").onclick = () => setAuthMode("sign");
  $("#aX").onclick = () => $("#dlg").close();
  $("#aGo").onclick = submitAuth;
  $("#dlg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); submitAuth(); }
  });

  // Auto-restore: tanungin ang server kung may valid na session pa
  try {
    const data = await api("/me");
    if (data.user) showLoggedIn(data.user);
  } catch (e) {}
}
