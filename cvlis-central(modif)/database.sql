-- CVLIS Central database (MySQL 8+)
-- Patakbuhin ang buong file na ito sa SQLTools (connection: login). Safe i-run ulit.

CREATE DATABASE IF NOT EXISTS myLogin
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myLogin;

-- ===== Mga account =====
-- Hindi plain password ang nakasave. bcrypt hash lang (password_hash).
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Mga naka-login na session =====
-- Hash ng token ang nakasave, hindi mismong token.
CREATE TABLE IF NOT EXISTS login_session (
  token_hash CHAR(64) PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  INDEX idx_session_expires (expires_at),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== Announcements =====
CREATE TABLE IF NOT EXISTS announcements (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  month_abbr  VARCHAR(3)   NOT NULL,
  day_num     VARCHAR(2)   NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        VARCHAR(1000) NOT NULL,
  tag         VARCHAR(50)  NOT NULL DEFAULT 'General',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Events =====
CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  month_abbr  VARCHAR(3)   NOT NULL,
  day_num     VARCHAR(2)   NOT NULL,
  title       VARCHAR(200) NOT NULL,
  place       VARCHAR(200) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Default data (pumapasok lang kung walang laman ang table) =====
-- Baliktad ang pagkakasunod dahil newest id ang unang lumalabas sa website.
INSERT INTO announcements (month_abbr, day_num, title, body, tag)
SELECT * FROM (
  SELECT 'JUL' AS month_abbr, '15' AS day_num,
         'Registrar office closed for inventory, July 18' AS title,
         'Document requests filed that day will be processed starting July 19.' AS body,
         'Registrar' AS tag
  UNION ALL
  SELECT 'JUL', '22', 'Second quarter exam schedule now posted',
         'Junior High and Senior High schedules are up under Events — check your section''s time block.',
         'Academics'
  UNION ALL
  SELECT 'JUL', '28', 'Brigada Eskwela wrap-up and thank you to volunteers',
         'Classrooms across all grade levels have been repainted and repaired ahead of the term.',
         'General'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM announcements);

INSERT INTO events (month_abbr, day_num, title, place)
SELECT * FROM (
  SELECT 'AUG' AS month_abbr, '21' AS day_num,
         'Buwan ng Wika opening program' AS title, 'School grounds' AS place
  UNION ALL
  SELECT 'AUG', '11', 'Parent-Teacher conference', 'Covered court'
  UNION ALL
  SELECT 'AUG', '04', 'First day, 2nd quarter', 'All grade levels'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM events);

-- Check
SELECT 'users' AS tbl, COUNT(*) AS rows_count FROM users
UNION ALL SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL SELECT 'events', COUNT(*) FROM events;
