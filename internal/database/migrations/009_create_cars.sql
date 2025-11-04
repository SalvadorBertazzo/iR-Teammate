-- Migration: create cars catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Populate with common iRacing cars
INSERT OR IGNORE INTO cars (name) VALUES
    ('Porsche 992 GT3 R'),
    ('BMW M4 GT3'),
    ('Mercedes-AMG GT3 2020'),
    ('Audi R8 LMS GT3'),
    ('Ferrari 488 GT3 Evo'),
    ('Lamborghini Huracán GT3 EVO'),
    ('McLaren 720S GT3'),
    ('Ford GT GT3'),
    ('Aston Martin Vantage GT3'),
    ('Ligier JS P320'),
    ('Dallara P217'),
    ('BMW M4 GT4'),
    ('Mercedes-AMG GT4'),
    ('Porsche 718 Cayman GT4 Clubsport MR'),
    ('NASCAR Cup Next Gen');
