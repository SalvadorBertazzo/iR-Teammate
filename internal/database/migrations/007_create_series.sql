-- Migration: create series catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Populate with common iRacing series
INSERT OR IGNORE INTO series (name) VALUES
    ('IMSA'),
    ('VRS Endurance'),
    ('VRS Sprint'),
    ('GT3 Challenge'),
    ('LMP2 Challenge'),
    ('NASCAR Cup Series'),
    ('Formula A'),
    ('Formula B'),
    ('Formula C'),
    ('Skip Barber'),
    ('MX-5 Cup'),
    ('Porsche Cup'),
    ('Ferrari GT3 Challenge');
