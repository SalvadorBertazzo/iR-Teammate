-- Migration: create events catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Populate with common iRacing events
INSERT OR IGNORE INTO events (name) VALUES
    ('Daytona 24h'),
    ('Sebring 12h'),
    ('Le Mans 24h'),
    ('Spa 24h'),
    ('Bathurst 12h'),
    ('Nürburgring 24h'),
    ('Watkins Glen 6h'),
    ('Road Atlanta 500'),
    ('Monza 1000km'),
    ('Silverstone 1000km'),
    ('Custom Event');
