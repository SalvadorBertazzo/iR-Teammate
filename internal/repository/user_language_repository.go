package repository

import (
	"context"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type UserLanguageRepository struct {
	db *sqlx.DB
}

func NewUserLanguageRepository(db *sqlx.DB) *UserLanguageRepository {
	return &UserLanguageRepository{db: db}
}

func (r *UserLanguageRepository) GetByUserID(ctx context.Context, userID int64) ([]*model.Language, error) {
	var languages []*model.Language
	err := r.db.SelectContext(ctx, &languages, `
		SELECT l.code, l.name
		FROM user_languages ul
		JOIN languages l ON ul.language_code = l.code
		WHERE ul.user_id = ?
		ORDER BY l.code`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	return languages, nil
}

func (r *UserLanguageRepository) UpsertLanguages(ctx context.Context, userID int64, languageCodes []string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `DELETE FROM user_languages WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}

	for _, code := range languageCodes {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO user_languages (user_id, language_code)
			VALUES (?, ?)`,
			userID, code,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *UserLanguageRepository) GetAllLanguages(ctx context.Context) ([]*model.Language, error) {
	var languages []*model.Language
	err := r.db.SelectContext(ctx, &languages, `
		SELECT code, name
		FROM languages
		ORDER BY code`)
	if err != nil {
		return nil, err
	}
	return languages, nil
}
