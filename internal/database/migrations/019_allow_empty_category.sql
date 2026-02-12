-- Migration: relax category CHECK constraint to allow empty string
-- SQLite requires table recreation to modify CHECK constraints

PRAGMA foreign_keys=OFF;

CREATE TABLE posts_new (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL,

  title             TEXT    NOT NULL,
  body              TEXT    NOT NULL,

  event_id          INTEGER,
  series_id         INTEGER,
  car_class_id      INTEGER,
  track_id          INTEGER,

  category          TEXT    NOT NULL DEFAULT '' CHECK (category IN ('','sports_car','formula','oval','dirt_road','dirt_oval')),

  min_license_level TEXT    NOT NULL DEFAULT 'R' CHECK (min_license_level IN ('R','D','C','B','A','P')),
  min_irating       INTEGER NOT NULL DEFAULT 0 CHECK (min_irating >= 0),

  timezone          TEXT    NOT NULL DEFAULT 'UTC',
  event_start_at    DATETIME NULL,

  slots_total       INTEGER NOT NULL DEFAULT 1 CHECK (slots_total > 0),

  status            TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open','filled','closed','cancelled')),
  is_public         INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),

  contact_hint      TEXT    NOT NULL DEFAULT '',

  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL,
  FOREIGN KEY (car_class_id) REFERENCES car_classes(id) ON DELETE SET NULL,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL
);

INSERT INTO posts_new SELECT * FROM posts;
DROP TABLE posts;
ALTER TABLE posts_new RENAME TO posts;

CREATE INDEX IF NOT EXISTS idx_posts_category_status ON posts(category, status);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_public ON posts(status, is_public);
CREATE INDEX IF NOT EXISTS idx_posts_event_id ON posts(event_id);
CREATE INDEX IF NOT EXISTS idx_posts_series_id ON posts(series_id);
CREATE INDEX IF NOT EXISTS idx_posts_car_class_id ON posts(car_class_id);
CREATE INDEX IF NOT EXISTS idx_posts_track_id ON posts(track_id);

PRAGMA foreign_keys=ON;
