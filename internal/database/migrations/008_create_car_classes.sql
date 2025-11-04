-- Migration: create car_classes catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS car_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Populate with common car classes
INSERT OR IGNORE INTO car_classes (name) VALUES
    ('GT3'),
    ('GT4'),
    ('LMP2'),
    ('LMP3'),
    ('GTE'),
    ('DPi'),
    ('NASCAR Cup'),
    ('NASCAR Xfinity'),
    ('NASCAR Truck'),
    ('Formula A'),
    ('Formula B'),
    ('Formula C'),
    ('MX-5'),
    ('Skip Barber'),
    ('Porsche Cup');
