package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostCarClassRepository struct {
	db *sqlx.DB
}

func NewPostCarClassRepository(db *sqlx.DB) *PostCarClassRepository {
	return &PostCarClassRepository{db: db}
}

func (r *PostCarClassRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostCarClass, error) {
	var items []*model.PostCarClass
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, car_class_id
		FROM post_car_classes
		WHERE post_id = ?
		ORDER BY car_class_id ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostCarClassRepository) UpsertForPost(ctx context.Context, postID int64, carClassIDs []int64) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_car_classes WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(carClassIDs) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_car_classes (post_id, car_class_id) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, ccid := range carClassIDs {
			if _, err = stmt.ExecContext(ctx, postID, ccid); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (r *PostCarClassRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_car_classes WHERE post_id = ?`, postID)
	return err
}
