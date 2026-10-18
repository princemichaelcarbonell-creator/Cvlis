/* Gumagawa (o nag-uupdate) ng admin account sa database.
   Run:  npm run seed-admin
   Kinukuha ang ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME sa .env */
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

(async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = process.env.ADMIN_NAME || "School Principal";

  if (!email || password.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) in .env first.");
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "myLogin"
  });

  const hash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name),
                             password_hash = VALUES(password_hash),
                             role = 'admin'`,
    [name, email, hash]
  );
  console.log("Admin account ready:", email);
  await db.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
