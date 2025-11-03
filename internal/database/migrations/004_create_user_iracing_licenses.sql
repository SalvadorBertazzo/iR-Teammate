-- Migration: create user_iracing_licenses table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS user_iracing_licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_iracing_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    license_level TEXT NOT NULL,
    irating INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_iracing_id, category),
    FOREIGN KEY (user_iracing_id) REFERENCES user_iracings(id) ON DELETE CASCADE,
    CHECK (category IN ('road','oval','dirt_road','dirt_oval')),
    CHECK (license_level IN ('R','D','C','B','A','P'))
);

