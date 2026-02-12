package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostSeriesRepository struct {
	db *sqlx.DB
}

func NewPostSeriesRepository(db *sqlx.DB) *PostSeriesRepository {
	return &PostSeriesRepository{db: db}
}

func (r *PostSeriesRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostSeries, error) {
	var items []*model.PostSeries
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, series_id
		FROM post_series
		WHERE post_id = ?
		ORDER BY series_id ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostSeriesRepository) UpsertForPost(ctx context.Context, postID int64, seriesIDs []int64) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_series WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(seriesIDs) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_series (post_id, series_id) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, sid := range seriesIDs {
			if _, err = stmt.ExecContext(ctx, postID, sid); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (r *PostSeriesRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_series WHERE post_id = ?`, postID)
	return err
}
