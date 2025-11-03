-- Migration: create user_iracings table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS user_iracings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    iracing_id INTEGER UNIQUE,
    display_name TEXT NOT NULL,
    club TEXT,
    timezone TEXT,
    preferred_racing_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

