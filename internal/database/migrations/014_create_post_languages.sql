-- Migration: create post_languages junction table (N:M relationship)
-- SQLite dialect

CREATE TABLE IF NOT EXISTS post_languages (
  post_id       INTEGER NOT NULL,
  language_code TEXT    NOT NULL,
  PRIMARY KEY (post_id, language_code),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE RESTRICT
);
