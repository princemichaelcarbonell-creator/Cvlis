require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "myLogin",
  waitForConnections: true,
  connectionLimit: 10
});

const COOKIE_NAME = "cvlis_sid";
const SESSION_DAYS = 7;
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/* ---------- Sessions ---------- */
async function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO login_session (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))",
    [sha256(token), userId, SESSION_DAYS]
  );
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
  });
}

async function loadUser(req, res, next) {
  req.user = null;
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const [rows] = await pool.query(
        `SELECT u.id, u.full_name AS name, u.email, u.role
           FROM login_session s JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ? AND s.expires_at > NOW()`,
        [sha256(token)]
      );
      if (rows[0]) req.user = rows[0];
    } catch (e) { return next(e); }
  }
  next();
}
app.use(loadUser);

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only." });
  }
  next();
}

const publicUser = (u) => ({ name: u.name, email: u.email, role: u.role });

/* ---------- Auth ---------- */
app.post("/api/signup", wrap(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) return res.status(400).json({ error: "Please fill in all fields." });
  if (name.length > 100) return res.status(400).json({ error: "Name is too long." });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 190) return res.status(400).json({ error: "Please enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (password.length > 72) return res.status(400).json({ error: "Password is too long (max 72 characters)." });

  const hash = await bcrypt.hash(password, 12);
  try {
    // Laging 'student' ang role sa signup. Admin ay sa seed-admin.js lang ginagawa.
    const [r] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
      [name, email, hash]
    );
    await createSession(res, r.insertId);
    res.json({ user: { name, email, role: "student" } });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Account already exists. Try logging in." });
    throw e;
  }
}));

app.post("/api/login", wrap(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ error: "Please fill in all fields." });

  const [rows] = await pool.query(
    "SELECT id, full_name AS name, email, role, password_hash FROM users WHERE email = ?", [email]
  );
  const u = rows[0];
  const ok = u && await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong email or password." });

  await pool.query("DELETE FROM login_session WHERE expires_at < NOW()");
  await createSession(res, u.id);
  res.json({ user: publicUser(u) });
}));

app.post("/api/logout", wrap(async (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (token) await pool.query("DELETE FROM login_session WHERE token_hash = ?", [sha256(token)]);
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
}));

app.get("/api/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

/* ---------- Announcements ---------- */
function readAnn(b) {
  const month = String(b.month || "").trim().toUpperCase();
  const day = String(b.day || "").trim();
  const title = String(b.title || "").trim();
  const text = String(b.text || "").trim();
  const tag = String(b.tag || "").trim() || "General";
  if (!month || !day || !title || !text) return { error: "Please fill in month, day, title, and description." };
  if (month.length > 3 || day.length > 2) return { error: "Month should be 3 letters (e.g. AUG). Day should be 1–2 digits." };
  if (title.length > 200 || text.length > 1000 || tag.length > 50) return { error: "One of the fields is too long." };
  return { v: [month, day, title, text, tag] };
}

app.get("/api/news", wrap(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, month_abbr AS month, day_num AS day, title, body AS text, tag FROM announcements ORDER BY id DESC"
  );
  res.json(rows);
}));

app.post("/api/news", requireAdmin, wrap(async (req, res) => {
  const { v, error } = readAnn(req.body);
  if (error) return res.status(400).json({ error });
  await pool.query("INSERT INTO announcements (month_abbr, day_num, title, body, tag) VALUES (?,?,?,?,?)", v);
  res.json({ ok: true });
}));

app.put("/api/news/:id", requireAdmin, wrap(async (req, res) => {
  const { v, error } = readAnn(req.body);
  if (error) return res.status(400).json({ error });
  await pool.query(
    "UPDATE announcements SET month_abbr=?, day_num=?, title=?, body=?, tag=? WHERE id=?",
    [...v, Number(req.params.id)]
  );
  res.json({ ok: true });
}));

app.delete("/api/news/:id", requireAdmin, wrap(async (req, res) => {
  await pool.query("DELETE FROM announcements WHERE id=?", [Number(req.params.id)]);
  res.json({ ok: true });
}));

/* ---------- Events ---------- */
function readEv(b) {
  const month = String(b.month || "").trim().toUpperCase();
  const day = String(b.day || "").trim();
  const title = String(b.title || "").trim();
  const place = String(b.place || "").trim();
  if (!month || !day || !title || !place) return { error: "Please fill in month, day, title, and place." };
  if (month.length > 3 || day.length > 2) return { error: "Month should be 3 letters (e.g. SEP). Day should be 1–2 digits." };
  if (title.length > 200 || place.length > 200) return { error: "One of the fields is too long." };
  return { v: [month, day, title, place] };
}

app.get("/api/events", wrap(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, month_abbr AS month, day_num AS day, title, place FROM events ORDER BY id DESC"
  );
  res.json(rows);
}));

app.post("/api/events", requireAdmin, wrap(async (req, res) => {
  const { v, error } = readEv(req.body);
  if (error) return res.status(400).json({ error });
  await pool.query("INSERT INTO events (month_abbr, day_num, title, place) VALUES (?,?,?,?)", v);
  res.json({ ok: true });
}));

app.put("/api/events/:id", requireAdmin, wrap(async (req, res) => {
  const { v, error } = readEv(req.body);
  if (error) return res.status(400).json({ error });
  await pool.query(
    "UPDATE events SET month_abbr=?, day_num=?, title=?, place=? WHERE id=?",
    [...v, Number(req.params.id)]
  );
  res.json({ ok: true });
}));

app.delete("/api/events/:id", requireAdmin, wrap(async (req, res) => {
  await pool.query("DELETE FROM events WHERE id=?", [Number(req.params.id)]);
  res.json({ ok: true });
}));

/* ---------- Static website ---------- */
const PUBLIC = path.join(__dirname, "public");
app.use(express.static(PUBLIC));
app.get("/", (req, res) => res.sendFile(path.join(PUBLIC, "Home.html")));

/* ---------- Errors ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error. Please try again." });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`CVLIS Central running at http://localhost:${PORT}`));
