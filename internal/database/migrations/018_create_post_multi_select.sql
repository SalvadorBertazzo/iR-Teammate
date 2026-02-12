-- Migration: create junction tables for post multi-select
-- Posts can now have multiple categories, series, car classes, and tracks
-- SQLite dialect

-- Categories selected for a post
CREATE TABLE IF NOT EXISTS post_categories (
    post_id  INTEGER NOT NULL,
    category TEXT    NOT NULL CHECK (category IN ('sports_car','formula','oval','dirt_road','dirt_oval')),
    PRIMARY KEY (post_id, category),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);

-- Series selected for a post
CREATE TABLE IF NOT EXISTS post_series (
    post_id   INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, series_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_series_post_id ON post_series(post_id);
CREATE INDEX IF NOT EXISTS idx_post_series_series_id ON post_series(series_id);

-- Car classes selected for a post
CREATE TABLE IF NOT EXISTS post_car_classes (
    post_id      INTEGER NOT NULL,
    car_class_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, car_class_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (car_class_id) REFERENCES car_classes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_car_classes_post_id ON post_car_classes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_car_classes_car_class_id ON post_car_classes(car_class_id);

-- Tracks selected for a post
CREATE TABLE IF NOT EXISTS post_tracks (
    post_id  INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, track_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_tracks_post_id ON post_tracks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tracks_track_id ON post_tracks(track_id);
