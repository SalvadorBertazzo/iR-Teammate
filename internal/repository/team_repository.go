package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type TeamRepository struct {
	db *sqlx.DB
}

func NewTeamRepository(db *sqlx.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

// CreateMessage inserts a new team message and returns its ID
func (r *TeamRepository) CreateMessage(ctx context.Context, msg *model.TeamMessage) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO team_messages (post_id, user_id, body)
		VALUES (?, ?, ?)
	`, msg.PostID, msg.UserID, msg.Body)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// GetMessageByID returns a single message by ID
func (r *TeamRepository) GetMessageByID(ctx context.Context, id int64) (*model.TeamMessage, error) {
	var msg model.TeamMessage
	err := r.db.GetContext(ctx, &msg, `
		SELECT id, post_id, user_id, body, created_at
		FROM team_messages
		WHERE id = ?
	`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

// ListMessages returns messages for a post, optionally after a given message ID (for polling)
func (r *TeamRepository) ListMessages(ctx context.Context, postID int64, afterID int64) ([]*model.TeamMessage, error) {
	var items []*model.TeamMessage
	var err error
	if afterID > 0 {
		err = r.db.SelectContext(ctx, &items, `
			SELECT id, post_id, user_id, body, created_at
			FROM team_messages
			WHERE post_id = ? AND id > ?
			ORDER BY id ASC
		`, postID, afterID)
	} else {
		err = r.db.SelectContext(ctx, &items, `
			SELECT id, post_id, user_id, body, created_at
			FROM team_messages
			WHERE post_id = ?
			ORDER BY id ASC
			LIMIT 100
		`, postID)
	}
	if err != nil {
		return nil, err
	}
	return items, nil
}
