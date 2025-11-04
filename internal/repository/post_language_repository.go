package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostLanguageRepository struct {
	db *sqlx.DB
}

func NewPostLanguageRepository(db *sqlx.DB) *PostLanguageRepository {
	return &PostLanguageRepository{db: db}
}

// GetByPostID returns all language codes linked to a post
func (r *PostLanguageRepository) GetByPostID(ctx context.Context, postID int64) ([]*model.PostLanguage, error) {
	var items []*model.PostLanguage
	if err := r.db.SelectContext(ctx, &items, `
		SELECT post_id, language_code
		FROM post_languages
		WHERE post_id = ?
		ORDER BY language_code ASC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

// UpsertForPost replaces the full set of language relations for a post in a transaction
func (r *PostLanguageRepository) UpsertForPost(ctx context.Context, postID int64, languageCodes []string) error {
	tx, err := r.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.ExecContext(ctx, `DELETE FROM post_languages WHERE post_id = ?`, postID); err != nil {
		return err
	}
	if len(languageCodes) > 0 {
		stmt, prepErr := tx.PreparexContext(ctx, `INSERT OR IGNORE INTO post_languages (post_id, language_code) VALUES (?, ?)`)
		if prepErr != nil {
			return prepErr
		}
		defer stmt.Close()
		for _, code := range languageCodes {
			if _, err = stmt.ExecContext(ctx, postID, code); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

// DeleteByPostID removes all relations for a post
func (r *PostLanguageRepository) DeleteByPostID(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM post_languages WHERE post_id = ?`, postID)
	return err
}
