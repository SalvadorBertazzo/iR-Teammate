package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostTrackRepository struct {
	db *sqlx.DB
}

func NewPostTrackRepository(db *sqlx.DB) *PostTrackRepository {
	return &PostTrackRepository{db: db}
}

func (r *PostTrackRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostTrack, error) {
	var items []*model.PostTrack
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, track_id
		FROM post_tracks
		WHERE post_id = ?
		ORDER BY track_id ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostTrackRepository) UpsertForPost(ctx context.Context, postID int64, trackIDs []int64) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_tracks WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(trackIDs) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_tracks (post_id, track_id) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, tid := range trackIDs {
			if _, err = stmt.ExecContext(ctx, postID, tid); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (r *PostTrackRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_tracks WHERE post_id = ?`, postID)
	return err
}
