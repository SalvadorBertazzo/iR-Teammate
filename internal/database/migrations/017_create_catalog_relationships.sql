-- Migration: create catalog relationship tables
-- These tables model the iRacing hierarchy: Category -> Series -> CarClass -> Car
-- SQLite dialect

-- Which categories each series belongs to
CREATE TABLE IF NOT EXISTS series_categories (
    series_id INTEGER NOT NULL,
    category  TEXT    NOT NULL CHECK (category IN ('sports_car','formula','oval','dirt_road','dirt_oval')),
    PRIMARY KEY (series_id, category),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

-- Which car classes each series contains
CREATE TABLE IF NOT EXISTS series_car_classes (
    series_id    INTEGER NOT NULL,
    car_class_id INTEGER NOT NULL,
    PRIMARY KEY (series_id, car_class_id),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (car_class_id) REFERENCES car_classes(id) ON DELETE CASCADE
);

-- Which cars each car class contains
CREATE TABLE IF NOT EXISTS car_class_cars (
    car_class_id INTEGER NOT NULL,
    car_id       INTEGER NOT NULL,
    PRIMARY KEY (car_class_id, car_id),
    FOREIGN KEY (car_class_id) REFERENCES car_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Indexes for reverse lookups
CREATE INDEX IF NOT EXISTS idx_series_categories_category ON series_categories(category);
CREATE INDEX IF NOT EXISTS idx_series_car_classes_car_class_id ON series_car_classes(car_class_id);
CREATE INDEX IF NOT EXISTS idx_car_class_cars_car_id ON car_class_cars(car_id);

-- Seed data: series_categories
INSERT OR IGNORE INTO series_categories (series_id, category) VALUES
    ((SELECT id FROM series WHERE name = 'IMSA'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'VRS Endurance'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'VRS Sprint'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'GT3 Challenge'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'LMP2 Challenge'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'Porsche Cup'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'Ferrari GT3 Challenge'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'MX-5 Cup'), 'sports_car'),
    ((SELECT id FROM series WHERE name = 'Formula A'), 'formula'),
    ((SELECT id FROM series WHERE name = 'Formula B'), 'formula'),
    ((SELECT id FROM series WHERE name = 'Formula C'), 'formula'),
    ((SELECT id FROM series WHERE name = 'Skip Barber'), 'formula'),
    ((SELECT id FROM series WHERE name = 'NASCAR Cup Series'), 'oval');

-- Seed data: series_car_classes
INSERT OR IGNORE INTO series_car_classes (series_id, car_class_id) VALUES
    ((SELECT id FROM series WHERE name = 'IMSA'), (SELECT id FROM car_classes WHERE name = 'GT3')),
    ((SELECT id FROM series WHERE name = 'IMSA'), (SELECT id FROM car_classes WHERE name = 'LMP2')),
    ((SELECT id FROM series WHERE name = 'IMSA'), (SELECT id FROM car_classes WHERE name = 'GTE')),
    ((SELECT id FROM series WHERE name = 'IMSA'), (SELECT id FROM car_classes WHERE name = 'DPi')),
    ((SELECT id FROM series WHERE name = 'VRS Endurance'), (SELECT id FROM car_classes WHERE name = 'GT3')),
    ((SELECT id FROM series WHERE name = 'VRS Endurance'), (SELECT id FROM car_classes WHERE name = 'LMP2')),
    ((SELECT id FROM series WHERE name = 'VRS Sprint'), (SELECT id FROM car_classes WHERE name = 'GT3')),
    ((SELECT id FROM series WHERE name = 'GT3 Challenge'), (SELECT id FROM car_classes WHERE name = 'GT3')),
    ((SELECT id FROM series WHERE name = 'LMP2 Challenge'), (SELECT id FROM car_classes WHERE name = 'LMP2')),
    ((SELECT id FROM series WHERE name = 'Porsche Cup'), (SELECT id FROM car_classes WHERE name = 'Porsche Cup')),
    ((SELECT id FROM series WHERE name = 'Ferrari GT3 Challenge'), (SELECT id FROM car_classes WHERE name = 'GT3')),
    ((SELECT id FROM series WHERE name = 'MX-5 Cup'), (SELECT id FROM car_classes WHERE name = 'MX-5')),
    ((SELECT id FROM series WHERE name = 'Formula A'), (SELECT id FROM car_classes WHERE name = 'Formula A')),
    ((SELECT id FROM series WHERE name = 'Formula B'), (SELECT id FROM car_classes WHERE name = 'Formula B')),
    ((SELECT id FROM series WHERE name = 'Formula C'), (SELECT id FROM car_classes WHERE name = 'Formula C')),
    ((SELECT id FROM series WHERE name = 'Skip Barber'), (SELECT id FROM car_classes WHERE name = 'Skip Barber')),
    ((SELECT id FROM series WHERE name = 'NASCAR Cup Series'), (SELECT id FROM car_classes WHERE name = 'NASCAR Cup'));

-- Seed data: car_class_cars
INSERT OR IGNORE INTO car_class_cars (car_class_id, car_id) VALUES
    -- GT3
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Acura NSX GT3 EVO 22')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Aston Martin Vantage GT3 EVO')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Audi R8 LMS EVO II GT3')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'BMW M4 GT3 EVO')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Chevrolet Corvette Z06 GT3.R')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Ferrari 296 GT3')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Ferrari 488 GT3 Evo 2020')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Ford Mustang GT3')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Lamborghini Huracán GT3 EVO')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'McLaren 720S GT3 EVO')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Mercedes-AMG GT3 2020')),
    ((SELECT id FROM car_classes WHERE name = 'GT3'), (SELECT id FROM cars WHERE name = 'Porsche 911 GT3 R (992)')),
    -- GT4
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'Aston Martin Vantage GT4')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'BMW M4 F82 GT4 - 2018')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'BMW M4 G82 GT4 Evo')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'Ford Mustang GT4')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'McLaren 570S GT4')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'Mercedes-AMG GT4')),
    ((SELECT id FROM car_classes WHERE name = 'GT4'), (SELECT id FROM cars WHERE name = 'Porsche 718 Cayman GT4 Clubsport MR')),
    -- LMP2
    ((SELECT id FROM car_classes WHERE name = 'LMP2'), (SELECT id FROM cars WHERE name = 'Dallara P217')),
    -- LMP3
    ((SELECT id FROM car_classes WHERE name = 'LMP3'), (SELECT id FROM cars WHERE name = 'Ligier JS P320')),
    -- GTE
    ((SELECT id FROM car_classes WHERE name = 'GTE'), (SELECT id FROM cars WHERE name = 'BMW M8 GTE')),
    ((SELECT id FROM car_classes WHERE name = 'GTE'), (SELECT id FROM cars WHERE name = 'Chevrolet Corvette C8.R GTE')),
    ((SELECT id FROM car_classes WHERE name = 'GTE'), (SELECT id FROM cars WHERE name = 'Ferrari 488 GTE')),
    ((SELECT id FROM car_classes WHERE name = 'GTE'), (SELECT id FROM cars WHERE name = 'Ford GTE')),
    ((SELECT id FROM car_classes WHERE name = 'GTE'), (SELECT id FROM cars WHERE name = 'Porsche 911 RSR')),
    -- DPi / GTP
    ((SELECT id FROM car_classes WHERE name = 'DPi'), (SELECT id FROM cars WHERE name = 'Acura ARX-06 GTP')),
    ((SELECT id FROM car_classes WHERE name = 'DPi'), (SELECT id FROM cars WHERE name = 'BMW M Hybrid V8')),
    ((SELECT id FROM car_classes WHERE name = 'DPi'), (SELECT id FROM cars WHERE name = 'Cadillac V-Series.R GTP')),
    ((SELECT id FROM car_classes WHERE name = 'DPi'), (SELECT id FROM cars WHERE name = 'Porsche 963 GTP')),
    -- NASCAR Cup
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Cup'), (SELECT id FROM cars WHERE name = 'NASCAR Cup Series Next Gen Chevrolet Camaro ZL1')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Cup'), (SELECT id FROM cars WHERE name = 'NASCAR Cup Series Next Gen Ford Mustang')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Cup'), (SELECT id FROM cars WHERE name = 'NASCAR Cup Series Next Gen Toyota Camry')),
    -- NASCAR Xfinity
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Xfinity'), (SELECT id FROM cars WHERE name = 'NASCAR XFINITY Chevrolet Camaro')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Xfinity'), (SELECT id FROM cars WHERE name = 'NASCAR XFINITY Ford Mustang')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Xfinity'), (SELECT id FROM cars WHERE name = 'NASCAR XFINITY Toyota Supra')),
    -- NASCAR Truck
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Truck'), (SELECT id FROM cars WHERE name = 'NASCAR Truck Chevrolet Silverado')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Truck'), (SELECT id FROM cars WHERE name = 'NASCAR Truck Ford F150')),
    ((SELECT id FROM car_classes WHERE name = 'NASCAR Truck'), (SELECT id FROM cars WHERE name = 'NASCAR Truck Toyota Tundra TRD Pro')),
    -- Formula A
    ((SELECT id FROM car_classes WHERE name = 'Formula A'), (SELECT id FROM cars WHERE name = 'Dallara iR-01')),
    ((SELECT id FROM car_classes WHERE name = 'Formula A'), (SELECT id FROM cars WHERE name = 'McLaren MP4-30')),
    ((SELECT id FROM car_classes WHERE name = 'Formula A'), (SELECT id FROM cars WHERE name = 'Mercedes-AMG W12 E Performance')),
    ((SELECT id FROM car_classes WHERE name = 'Formula A'), (SELECT id FROM cars WHERE name = 'Mercedes-AMG W13 E Performance')),
    -- Formula B
    ((SELECT id FROM car_classes WHERE name = 'Formula B'), (SELECT id FROM cars WHERE name = 'Dallara IR18')),
    ((SELECT id FROM car_classes WHERE name = 'Formula B'), (SELECT id FROM cars WHERE name = 'Super Formula SF23 - Toyota')),
    -- Formula C
    ((SELECT id FROM car_classes WHERE name = 'Formula C'), (SELECT id FROM cars WHERE name = 'Dallara F3')),
    ((SELECT id FROM car_classes WHERE name = 'Formula C'), (SELECT id FROM cars WHERE name = 'FIA F4')),
    ((SELECT id FROM car_classes WHERE name = 'Formula C'), (SELECT id FROM cars WHERE name = 'Formula Renault 2.0')),
    ((SELECT id FROM car_classes WHERE name = 'Formula C'), (SELECT id FROM cars WHERE name = 'Formula Renault 3.5')),
    -- MX-5
    ((SELECT id FROM car_classes WHERE name = 'MX-5'), (SELECT id FROM cars WHERE name = 'Global Mazda MX-5 Cup')),
    -- Skip Barber
    ((SELECT id FROM car_classes WHERE name = 'Skip Barber'), (SELECT id FROM cars WHERE name = 'Skip Barber Formula 2000')),
    -- Porsche Cup
    ((SELECT id FROM car_classes WHERE name = 'Porsche Cup'), (SELECT id FROM cars WHERE name = 'Porsche 911 Cup (992.2)'));
