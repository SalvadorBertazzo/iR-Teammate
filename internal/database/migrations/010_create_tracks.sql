-- Migration: create tracks catalog table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Populate with common iRacing tracks
INSERT OR IGNORE INTO tracks (name) VALUES
    ('Daytona International Speedway'),
    ('Sebring International Raceway'),
    ('Circuit des 24 Heures du Mans'),
    ('Circuit de Spa-Francorchamps'),
    ('Mount Panorama Circuit'),
    ('Nürburgring Grand-Prix-Strecke'),
    ('Nürburgring Nordschleife'),
    ('Watkins Glen International'),
    ('Road Atlanta'),
    ('Monza (Autodromo Nazionale di Monza)'),
    ('Silverstone Circuit'),
    ('Interlagos (Autódromo José Carlos Pace)'),
    ('Suzuka International Racing Course'),
    ('Circuit of the Americas'),
    ('Indianapolis Motor Speedway'),
    ('Charlotte Motor Speedway'),
    ('Talladega Superspeedway'),
    ('Michigan International Speedway'),
    ('Bristol Motor Speedway'),
    ('Martinsville Speedway'),
    ('Phoenix Raceway'),
    ('Las Vegas Motor Speedway'),
    ('Homestead-Miami Speedway'),
    ('Auto Club Speedway'),
    ('Texas Motor Speedway'),
    ('Kansas Speedway'),
    ('Darlington Raceway'),
    ('Richmond Raceway'),
    ('New Hampshire Motor Speedway'),
    ('Dover Motor Speedway'),
    ('Pocono Raceway'),
    ('Iowa Speedway'),
    ('Gateway Motorsports Park'),
    ('Road America'),
    ('Lime Rock Park'),
    ('Virginia International Raceway'),
    ('Sonoma Raceway'),
    ('Long Beach Street Circuit'),
    ('Laguna Seca'),
    ('Barber Motorsports Park'),
    ('Mid-Ohio Sports Car Course'),
    ('Canadian Tire Motorsport Park'),
    ('Zandvoort Circuit');
