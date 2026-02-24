CREATE TABLE IF NOT EXISTS team_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_messages_post_id ON team_messages(post_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(post_id, created_at);
