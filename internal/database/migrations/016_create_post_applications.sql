-- Migration: create post_applications table
-- SQLite dialect

CREATE TABLE IF NOT EXISTS post_applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id       INTEGER NOT NULL,
  applicant_id  INTEGER NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message       TEXT    NOT NULL DEFAULT '',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Prevent duplicate applications: one user can only apply once per post
  UNIQUE(post_id, applicant_id)
);

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_post_applications_post_id ON post_applications(post_id);
CREATE INDEX IF NOT EXISTS idx_post_applications_applicant_id ON post_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_post_applications_status ON post_applications(status);
CREATE INDEX IF NOT EXISTS idx_post_applications_post_status ON post_applications(post_id, status);
CREATE INDEX IF NOT EXISTS idx_post_applications_created_at ON post_applications(created_at DESC);

