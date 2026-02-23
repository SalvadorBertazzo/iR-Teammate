-- Migration: seed data for development/testing
-- Remove this file before production deployment

-- ============================================================
-- USERS (fake Discord accounts)
-- ============================================================
INSERT OR IGNORE INTO users (id, discord_id, username, global_name, email, avatar, created_at) VALUES
    (1, '100000000000000001', 'sal_racer',    'Salvador',   'sal@example.com',    NULL, datetime('now', '-30 days')),
    (2, '100000000000000002', 'apex_hunter',  'Carlos M.',  'carlos@example.com', NULL, datetime('now', '-28 days')),
    (3, '100000000000000003', 'ovaldrift99',  'Mike T.',    'mike@example.com',   NULL, datetime('now', '-25 days')),
    (4, '100000000000000004', 'formula_ghost','Ana P.',     'ana@example.com',    NULL, datetime('now', '-20 days')),
    (5, '100000000000000005', 'dirty_wheels', 'Jake S.',    'jake@example.com',   NULL, datetime('now', '-18 days')),
    (6, '100000000000000006', 'midnight_lap', 'Laura V.',   'laura@example.com',  NULL, datetime('now', '-15 days')),
    (7, '100000000000000007', 'enduro_king',  'Pedro R.',   'pedro@example.com',  NULL, datetime('now', '-10 days')),
    (8, '100000000000000008', 'simracer_eu',  'Tom W.',     'tom@example.com',    NULL, datetime('now', '-5 days'));

-- ============================================================
-- USER iRACING PROFILES
-- ============================================================
INSERT OR IGNORE INTO user_iracings (id, user_id, iracing_id, display_name, club, timezone, preferred_racing_time, contact_hint, created_at, updated_at) VALUES
    (1, 1, '654321', 'sal_racer',    'Argentina',      'America/Argentina/Buenos_Aires', 'evenings',  'Discord: sal_racer#0001',    datetime('now', '-30 days'), datetime('now', '-30 days')),
    (2, 2, '123456', 'CarlosM_iR',   'Spain',          'Europe/Madrid',                 'weekends',  'Discord: apex_hunter#0002',  datetime('now', '-28 days'), datetime('now', '-28 days')),
    (3, 3, '789012', 'OvalDrift99',  'United States',  'America/New_York',              'nights',    'Discord: ovaldrift99#0003',  datetime('now', '-25 days'), datetime('now', '-25 days')),
    (4, 4, '345678', 'FormulaGhost', 'Brazil',         'America/Sao_Paulo',             'evenings',  'Discord: formula_ghost#0004',datetime('now', '-20 days'), datetime('now', '-20 days')),
    (5, 5, '901234', 'DirtyWheels',  'United States',  'America/Chicago',               'mornings',  'Discord: dirty_wheels#0005', datetime('now', '-18 days'), datetime('now', '-18 days')),
    (6, 6, '567890', 'MidnightLap',  'Germany',        'Europe/Berlin',                 'late nights','Discord: midnight_lap#0006',datetime('now', '-15 days'), datetime('now', '-15 days')),
    (7, 7, '234567', 'EnduroKing',   'Portugal',       'Europe/Lisbon',                 'weekends',  'Discord: enduro_king#0007',  datetime('now', '-10 days'), datetime('now', '-10 days')),
    (8, 8, '890123', 'SimRacerEU',   'Netherlands',    'Europe/Amsterdam',              'evenings',  'Discord: simracer_eu#0008',  datetime('now', '-5 days'),  datetime('now', '-5 days'));

-- ============================================================
-- iRACING LICENSES
-- ============================================================
INSERT OR IGNORE INTO user_iracing_licenses (user_iracing_id, category, license_level, irating, updated_at) VALUES
    -- sal_racer: solid B/A GT3 driver
    (1, 'sports_car', 'A', 3200, datetime('now', '-2 days')),
    (1, 'formula',    'B', 2100, datetime('now', '-2 days')),
    (1, 'oval',       'D', 1200, datetime('now', '-2 days')),
    -- CarlosM: experienced GT/Endurance
    (2, 'sports_car', 'A', 4100, datetime('now', '-3 days')),
    (2, 'formula',    'A', 3500, datetime('now', '-3 days')),
    (2, 'oval',       'C', 1800, datetime('now', '-3 days')),
    -- OvalDrift: NASCAR specialist
    (3, 'sports_car', 'C', 1600, datetime('now', '-4 days')),
    (3, 'oval',       'A', 3800, datetime('now', '-4 days')),
    (3, 'dirt_road',  'B', 2200, datetime('now', '-4 days')),
    -- FormulaGhost: open-wheel focused
    (4, 'formula',    'A', 4500, datetime('now', '-5 days')),
    (4, 'sports_car', 'B', 2800, datetime('now', '-5 days')),
    -- DirtyWheels: dirt specialist
    (5, 'dirt_road',  'A', 3600, datetime('now', '-6 days')),
    (5, 'dirt_oval',  'B', 2400, datetime('now', '-6 days')),
    (5, 'oval',       'C', 1700, datetime('now', '-6 days')),
    -- MidnightLap: endurance GT
    (6, 'sports_car', 'A', 3900, datetime('now', '-7 days')),
    (6, 'formula',    'C', 1500, datetime('now', '-7 days')),
    -- EnduroKing: LMP/Endurance
    (7, 'sports_car', 'P', 5200, datetime('now', '-8 days')),
    (7, 'formula',    'B', 2600, datetime('now', '-8 days')),
    -- SimRacerEU: rookie building up
    (8, 'sports_car', 'C', 1900, datetime('now', '-1 days')),
    (8, 'formula',    'D', 1100, datetime('now', '-1 days'));

-- ============================================================
-- USER LANGUAGES
-- ============================================================
INSERT OR IGNORE INTO user_languages (user_id, language_code) VALUES
    (1, 'es'), (1, 'en'),
    (2, 'es'), (2, 'en'),
    (3, 'en'),
    (4, 'pt'), (4, 'en'),
    (5, 'en'),
    (6, 'de'), (6, 'en'),
    (7, 'pt'), (7, 'en'),
    (8, 'en'), (8, 'nl');

-- ============================================================
-- POSTS
-- ============================================================
INSERT OR IGNORE INTO posts (id, user_id, title, body, event_id, series_id, car_class_id, track_id, category, min_license_level, min_irating, timezone, event_start_at, slots_total, status, is_public, contact_hint, created_at, updated_at) VALUES
    -- Post 1: Daytona 24h, LMP2, needs 2 co-drivers
    (1, 7, 'LMP2 crew for Daytona 24h – need 2 co-drivers',
     'Building a serious LMP2 team for the Daytona 24h. Looking for two experienced drivers with clean racecraft. I''ll be driving stints 1 and 4. Expect full briefing in Discord before the race.',
     (SELECT id FROM events WHERE name = 'Daytona 24h'),
     (SELECT id FROM series WHERE name = 'IMSA'),
     (SELECT id FROM car_classes WHERE name = 'LMP2'),
     (SELECT id FROM tracks WHERE name LIKE '%Daytona%' LIMIT 1),
     'sports_car', 'A', 3000,
     'America/New_York', datetime('now', '+14 days'), 3, 'open', 1, 'Discord: enduro_king#0007',
     datetime('now', '-9 days'), datetime('now', '-9 days')),

    -- Post 2: GT3 Challenge sprint race
    (2, 1, 'GT3 Challenge – looking for 1 teammate (Porsche 992)',
     'Running the new season of GT3 Challenge. I have a consistent A-license pace around 1:45 at Spa. Looking for someone who can match that tempo and communicate calmly in voice chat.',
     NULL,
     (SELECT id FROM series WHERE name = 'GT3 Challenge'),
     (SELECT id FROM car_classes WHERE name = 'GT3'),
     (SELECT id FROM tracks WHERE name LIKE '%Spa%' LIMIT 1),
     'sports_car', 'B', 2500,
     'America/Argentina/Buenos_Aires', NULL, 1, 'open', 1, 'Discord: sal_racer#0001',
     datetime('now', '-7 days'), datetime('now', '-7 days')),

    -- Post 3: Formula A
    (3, 4, 'Formula A – team league, need reliable driver',
     'Competing in a private league using Formula A cars. We race every Saturday at 20:00 UTC. Need someone who doesn''t dive-bomb and can hold their own in wheel-to-wheel combat. Experience in open wheel mandatory.',
     NULL,
     (SELECT id FROM series WHERE name = 'Formula A'),
     (SELECT id FROM car_classes WHERE name = 'Formula A'),
     NULL,
     'formula', 'A', 4000,
     'America/Sao_Paulo', NULL, 1, 'open', 1, 'Discord: formula_ghost#0004',
     datetime('now', '-6 days'), datetime('now', '-6 days')),

    -- Post 4: NASCAR Cup endurance
    (4, 3, 'NASCAR Cup – Superspeedway draft partner needed',
     'Running Talladega and Daytona ovals. Drafting partner makes the difference here. Looking for someone who understands pack racing etiquette and can communicate lap counts and positions in real time.',
     NULL,
     (SELECT id FROM series WHERE name = 'NASCAR Cup Series'),
     (SELECT id FROM car_classes WHERE name = 'NASCAR Cup'),
     (SELECT id FROM tracks WHERE name LIKE '%Talladega%' LIMIT 1),
     'oval', 'B', 2500,
     'America/New_York', NULL, 1, 'open', 1, 'Discord: ovaldrift99#0003',
     datetime('now', '-5 days'), datetime('now', '-5 days')),

    -- Post 5: Sebring 12h LMP2
    (5, 6, 'Sebring 12h – 3rd driver slot open (GT3)',
     'We already have 2 drivers confirmed for Sebring 12h. Looking for a 3rd driver to share the Audi R8 GT3. We''re aiming top 10 in class. Mandatory: clean stint history, teamspeak during race.',
     (SELECT id FROM events WHERE name = 'Sebring 12h'),
     (SELECT id FROM series WHERE name = 'VRS Endurance'),
     (SELECT id FROM car_classes WHERE name = 'GT3'),
     (SELECT id FROM tracks WHERE name LIKE '%Sebring%' LIMIT 1),
     'sports_car', 'B', 2800,
     'Europe/Berlin', datetime('now', '+21 days'), 1, 'open', 1, 'Discord: midnight_lap#0006',
     datetime('now', '-4 days'), datetime('now', '-4 days')),

    -- Post 6: Dirt road (filled)
    (6, 5, '[FILLED] Rally Cross team – 2 drivers found',
     'Already found my teammates, leaving post up for reference. We''re running the VRS Dirt Road series with the Subaru WRX.',
     NULL,
     NULL,
     NULL,
     NULL,
     'dirt_road', 'B', 2000,
     'America/Chicago', NULL, 2, 'filled', 1, '',
     datetime('now', '-10 days'), datetime('now', '-3 days')),

    -- Post 7: MX-5 Cup rookie friendly
    (7, 8, 'MX-5 Cup – fun league, all welcome (C+)',
     'Running a friendly MX-5 Cup league, no pressure, just clean racing. We use Discord for banter and debrief. Great for building racecraft. C license minimum just to weed out absolute beginners.',
     NULL,
     (SELECT id FROM series WHERE name = 'MX-5 Cup'),
     (SELECT id FROM car_classes WHERE name = 'MX-5'),
     NULL,
     'sports_car', 'C', 0,
     'Europe/Amsterdam', NULL, 3, 'open', 1, 'Discord: simracer_eu#0008',
     datetime('now', '-3 days'), datetime('now', '-3 days')),

    -- Post 8: Le Mans 24h, serious team
    (8, 2, 'Le Mans 24h – LMP2 + GT3 multi-class team',
     'Organizing a full multi-class team for Le Mans 24h. Slots available in both LMP2 and GT3 class. We have experienced team managers, strategy planning spreadsheets, and mandatory practice sessions before the race. Serious applicants only.',
     (SELECT id FROM events WHERE name = 'Le Mans 24h'),
     (SELECT id FROM series WHERE name = 'IMSA'),
     NULL,
     (SELECT id FROM tracks WHERE name LIKE '%Le Mans%' LIMIT 1),
     'sports_car', 'A', 3500,
     'Europe/Madrid', datetime('now', '+35 days'), 5, 'open', 1, 'Discord: apex_hunter#0002',
     datetime('now', '-2 days'), datetime('now', '-2 days')),

    -- Post 9: Formula B, cancelled
    (9, 4, 'Formula B team – season cancelled',
     'Season was cancelled due to low sign-ups from the organizers. Sorry!',
     NULL,
     (SELECT id FROM series WHERE name = 'Formula B'),
     (SELECT id FROM car_classes WHERE name = 'Formula B'),
     NULL,
     'formula', 'B', 2000,
     'America/Sao_Paulo', NULL, 1, 'cancelled', 1, '',
     datetime('now', '-15 days'), datetime('now', '-8 days')),

    -- Post 10: Porsche Cup, Spanish-speaking preferred
    (10, 1, 'Porsche Cup – equipo hispanohablante',
     'Buscamos un tercer piloto para la Porsche Cup. Preferiblemente hispanohablante. Sesiones los domingos a las 21:00 ART. Tenemos Discord activo, estrategia coordinada y ambiente relajado pero competitivo.',
     NULL,
     (SELECT id FROM series WHERE name = 'Porsche Cup'),
     (SELECT id FROM car_classes WHERE name = 'Porsche Cup'),
     NULL,
     'sports_car', 'C', 1500,
     'America/Argentina/Buenos_Aires', NULL, 1, 'open', 1, 'Discord: sal_racer#0001',
     datetime('now', '-1 days'), datetime('now', '-1 days'));

-- ============================================================
-- POST CATEGORIES (multi-select)
-- ============================================================
INSERT OR IGNORE INTO post_categories (post_id, category) VALUES
    (1, 'sports_car'),
    (2, 'sports_car'),
    (3, 'formula'),
    (4, 'oval'),
    (5, 'sports_car'),
    (6, 'dirt_road'),
    (7, 'sports_car'),
    (8, 'sports_car'),
    (9, 'formula'),
    (10, 'sports_car');

-- ============================================================
-- POST SERIES (multi-select)
-- ============================================================
INSERT OR IGNORE INTO post_series (post_id, series_id) VALUES
    (1, (SELECT id FROM series WHERE name = 'IMSA')),
    (1, (SELECT id FROM series WHERE name = 'VRS Endurance')),
    (2, (SELECT id FROM series WHERE name = 'GT3 Challenge')),
    (3, (SELECT id FROM series WHERE name = 'Formula A')),
    (4, (SELECT id FROM series WHERE name = 'NASCAR Cup Series')),
    (5, (SELECT id FROM series WHERE name = 'VRS Endurance')),
    (7, (SELECT id FROM series WHERE name = 'MX-5 Cup')),
    (8, (SELECT id FROM series WHERE name = 'IMSA')),
    (8, (SELECT id FROM series WHERE name = 'VRS Endurance')),
    (9, (SELECT id FROM series WHERE name = 'Formula B')),
    (10, (SELECT id FROM series WHERE name = 'Porsche Cup'));

-- ============================================================
-- POST CAR CLASSES (multi-select)
-- ============================================================
INSERT OR IGNORE INTO post_car_classes (post_id, car_class_id) VALUES
    (1, (SELECT id FROM car_classes WHERE name = 'LMP2')),
    (2, (SELECT id FROM car_classes WHERE name = 'GT3')),
    (3, (SELECT id FROM car_classes WHERE name = 'Formula A')),
    (4, (SELECT id FROM car_classes WHERE name = 'NASCAR Cup')),
    (5, (SELECT id FROM car_classes WHERE name = 'GT3')),
    (7, (SELECT id FROM car_classes WHERE name = 'MX-5')),
    (8, (SELECT id FROM car_classes WHERE name = 'LMP2')),
    (8, (SELECT id FROM car_classes WHERE name = 'GT3')),
    (9, (SELECT id FROM car_classes WHERE name = 'Formula B')),
    (10, (SELECT id FROM car_classes WHERE name = 'Porsche Cup'));

-- ============================================================
-- POST TRACKS (multi-select)
-- ============================================================
INSERT OR IGNORE INTO post_tracks (post_id, track_id) VALUES
    (4, (SELECT id FROM tracks WHERE name LIKE '%Talladega%' LIMIT 1)),
    (4, (SELECT id FROM tracks WHERE name LIKE '%Daytona%' LIMIT 1));

-- ============================================================
-- POST LANGUAGES
-- ============================================================
INSERT OR IGNORE INTO post_languages (post_id, language_code) VALUES
    (1,  'en'),
    (2,  'en'), (2,  'es'),
    (3,  'pt'), (3,  'en'),
    (4,  'en'),
    (5,  'en'), (5,  'de'),
    (7,  'en'),
    (8,  'en'), (8,  'es'),
    (10, 'es'), (10, 'en');

-- ============================================================
-- POST CARS
-- ============================================================
INSERT OR IGNORE INTO post_cars (post_id, car_id) VALUES
    (2,  (SELECT id FROM cars WHERE name LIKE '%Porsche 911 GT3 R%' LIMIT 1)),
    (5,  (SELECT id FROM cars WHERE name LIKE '%Audi R8%' LIMIT 1)),
    (10, (SELECT id FROM cars WHERE name LIKE '%Porsche%' LIMIT 1));

-- ============================================================
-- APPLICATIONS
-- ============================================================
INSERT OR IGNORE INTO post_applications (id, post_id, applicant_id, status, message, created_at, updated_at) VALUES
    -- Applications to post 1 (Daytona LMP2)
    (1, 1, 2, 'accepted', 'I have 8 endurance races under my belt, happy to take night stints. Discord active.', datetime('now', '-8 days'), datetime('now', '-7 days')),
    (2, 1, 6, 'pending',  'European here so night stints work great for my timezone. A-license sports car, 3900 iR.', datetime('now', '-6 days'), datetime('now', '-6 days')),
    -- Applications to post 2 (GT3 Challenge)
    (3, 2, 6, 'accepted', '3900 irating A license. Ran Spa multiple times this season, consistent 1:44s.', datetime('now', '-6 days'), datetime('now', '-5 days')),
    (4, 2, 8, 'rejected', 'I am C license but improving fast!', datetime('now', '-5 days'), datetime('now', '-4 days')),
    -- Applications to post 3 (Formula A)
    (5, 3, 2, 'pending',  'Formula A driver, 3500 irating. No dive bombs, I promise.', datetime('now', '-5 days'), datetime('now', '-5 days')),
    -- Applications to post 5 (Sebring GT3)
    (6, 5, 1, 'pending',  'A license 3200 iR. I can cover North/South America time stints. Teamspeak ready.', datetime('now', '-3 days'), datetime('now', '-3 days')),
    (7, 5, 7, 'pending',  'P license endurance veteran. Happy to assist even in GT3 class, know Sebring well.', datetime('now', '-2 days'), datetime('now', '-2 days')),
    -- Applications to post 7 (MX-5 fun)
    (8, 7, 1, 'accepted', 'Sounds fun, count me in!', datetime('now', '-2 days'), datetime('now', '-1 days')),
    (9, 7, 3, 'pending',  'B license oval guy but I want to try road racing more.', datetime('now', '-1 days'), datetime('now', '-1 days')),
    -- Applications to post 8 (Le Mans)
    (10, 8, 7, 'pending', 'P license LMP2 driver, done Le Mans 3 times. Ready for strategy calls.', datetime('now', '-1 days'), datetime('now', '-1 days')),
    (11, 8, 1, 'pending', 'A license 3200 iR GT3 driver. I can do GT3 slot, have experience with multi-class.', datetime('now', '-1 days'), datetime('now', '-1 days')),
    -- Applications to post 10 (Porsche Cup ES)
    (12, 10, 2, 'pending', 'Hablo español, tengo licencia A con 4100 iR. Me apunto para el domingo.', datetime('now', '-0 days'), datetime('now', '-0 days'));

-- ============================================================
-- COMMENTS
-- ============================================================
INSERT OR IGNORE INTO comments (id, post_id, user_id, parent_comment_id, body, created_at) VALUES
    -- Comments on post 1 (Daytona LMP2)
    (1,  1, 2, NULL, 'What car are you running? Dallara LMP2 or Ligier?', datetime('now', '-8 days')),
    (2,  1, 7, 1,    'Dallara P217. Planning to run the full 8h stint rotation.', datetime('now', '-8 days')),
    (3,  1, 6, NULL, 'Any requirements for voice comms setup? Push-to-talk or open mic?', datetime('now', '-6 days')),
    (4,  1, 7, 3,    'PTT preferred, Discord. Will share server link once team is confirmed.', datetime('now', '-6 days')),
    -- Comments on post 2 (GT3)
    (5,  2, 6, NULL, 'What split are you targeting?', datetime('now', '-6 days')),
    (6,  2, 1, 5,    'Top 3 splits hopefully, but realistically split 1–2 depending on entry count.', datetime('now', '-5 days')),
    -- Comments on post 3 (Formula A)
    (7,  3, 2, NULL, 'Is this the private league with the points system? Saw it on Discord.', datetime('now', '-5 days')),
    (8,  3, 4, 7,    'Yes, that one. DM me for the invite link.', datetime('now', '-5 days')),
    -- Comments on post 5 (Sebring GT3)
    (9,  5, 1, NULL, 'I applied. Quick question: will you do a practice session beforehand?', datetime('now', '-3 days')),
    (10, 5, 6, 9,    'Yes, mandatory 1h session 2 days before the race to align pit strategy.', datetime('now', '-2 days')),
    -- Comments on post 8 (Le Mans)
    (11, 8, 7, NULL, 'What car for LMP2 slot? And how many practice hours required?', datetime('now', '-1 days')),
    (12, 8, 2, 11,   'Dallara P217. Minimum 3h of practice solo + 1 team session. Details in Discord.', datetime('now', '-1 days')),
    (13, 8, 3, NULL, 'Any oval guys needed? I know it''s road but I can try GT3.', datetime('now', '-0 days')),
    (14, 8, 2, 13,   'Appreciate it but we need GT3 experience specifically. Check post requirements!', datetime('now', '-0 days'));
