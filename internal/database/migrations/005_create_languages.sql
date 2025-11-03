-- Migration: create languages catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Populate with common languages for iRacing community
INSERT OR IGNORE INTO languages (code, name) VALUES
    ('en', 'English'),
    ('es', 'Spanish'),
    ('pt', 'Portuguese'),
    ('fr', 'French'),
    ('de', 'German'),
    ('it', 'Italian'),
    ('nl', 'Dutch'),
    ('pl', 'Polish'),
    ('ru', 'Russian'),
    ('ja', 'Japanese'),
    ('ko', 'Korean'),
    ('zh', 'Chinese');
    