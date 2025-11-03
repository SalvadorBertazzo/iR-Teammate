-- Migration: create user_languages junction table (N:M)
-- SQLite dialect

CREATE TABLE IF NOT EXISTS user_languages (
    user_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    PRIMARY KEY (user_id, language_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE RESTRICT
);

