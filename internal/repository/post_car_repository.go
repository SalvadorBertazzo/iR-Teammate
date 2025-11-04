package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostCarRepository struct {
	db *sqlx.DB
}

func NewPostCarRepository(db *sqlx.DB) *PostCarRepository {
	return &PostCarRepository{db: db}
}

// GetByPostID returns all car IDs linked to a post
func (r *PostCarRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostCar, error) {
	var items []*model.PostCar
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, car_id
		FROM post_cars
		WHERE post_id = ?
		ORDER BY car_id ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

// UpsertForPost replaces the full set of car relations for a post in a transaction
func (r *PostCarRepository) UpsertForPost(ctx context.Context, postID int64, carIDs []int64) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_cars WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(carIDs) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_cars (post_id, car_id) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, carID := range carIDs {
			if _, err = stmt.ExecContext(ctx, postID, carID); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

// DeleteByPostID removes all relations for a post
func (r *PostCarRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_cars WHERE post_id = ?`, postID)
	return err
}
