-- Migration: create post_cars junction table (N:M relationship)
-- SQLite dialect

CREATE TABLE IF NOT EXISTS post_cars (
  post_id INTEGER NOT NULL,
  car_id  INTEGER NOT NULL,
  PRIMARY KEY (post_id, car_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_cars_post_id ON post_cars(post_id);
CREATE INDEX IF NOT EXISTS idx_post_cars_car_id ON post_cars(car_id);