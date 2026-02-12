package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostCategoryRepository struct {
	db *sqlx.DB
}

func NewPostCategoryRepository(db *sqlx.DB) *PostCategoryRepository {
	return &PostCategoryRepository{db: db}
}

func (r *PostCategoryRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostCategory, error) {
	var items []*model.PostCategory
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, category
		FROM post_categories
		WHERE post_id = ?
		ORDER BY category ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostCategoryRepository) UpsertForPost(ctx context.Context, postID int64, categories []string) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_categories WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(categories) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_categories (post_id, category) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, cat := range categories {
			if _, err = stmt.ExecContext(ctx, postID, cat); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (r *PostCategoryRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_categories WHERE post_id = ?`, postID)
	return err
}
