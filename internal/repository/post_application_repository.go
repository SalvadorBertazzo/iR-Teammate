package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostApplicationRepository struct {
	db *sqlx.DB
}

func NewPostApplicationRepository(db *sqlx.DB) *PostApplicationRepository {
	return &PostApplicationRepository{db: db}
}

func (r *PostApplicationRepository) Create(ctx context.Context, app *model.PostApplication) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO post_applications (post_id, applicant_id, status, message)
		VALUES (?, ?, ?, ?)
	`, app.PostID, app.ApplicantID, app.Status, app.Message)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *PostApplicationRepository) GetByID(ctx context.Context, id int64) (*model.PostApplication, error) {
	var app model.PostApplication
	err := r.db.GetContext(ctx, &app, `
		SELECT id, post_id, applicant_id, status, message, created_at, updated_at
		FROM post_applications
		WHERE id = ?
	`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *PostApplicationRepository) GetByPostAndApplicant(ctx context.Context, postID int64, applicantID int64) (*model.PostApplication, error) {
	var app model.PostApplication
	err := r.db.GetContext(ctx, &app, `
		SELECT id, post_id, applicant_id, status, message, created_at, updated_at
		FROM post_applications
		WHERE post_id = ? AND applicant_id = ?
	`, postID, applicantID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *PostApplicationRepository) ListByPost(ctx context.Context, postID int64) ([]*model.PostApplication, error) {
	var items []*model.PostApplication
	if err := r.db.SelectContext(ctx, &items, `
		SELECT id, post_id, applicant_id, status, message, created_at, updated_at
		FROM post_applications
		WHERE post_id = ?
		ORDER BY created_at DESC
	`, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostApplicationRepository) ListByPostAndStatus(ctx context.Context, postID int64, status string) ([]*model.PostApplication, error) {
	var items []*model.PostApplication
	if err := r.db.SelectContext(ctx, &items, `
		SELECT id, post_id, applicant_id, status, message, created_at, updated_at
		FROM post_applications
		WHERE post_id = ? AND status = ?
		ORDER BY created_at DESC
	`, postID, status); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostApplicationRepository) ListByApplicant(ctx context.Context, applicantID int64) ([]*model.PostApplication, error) {
	var items []*model.PostApplication
	if err := r.db.SelectContext(ctx, &items, `
		SELECT id, post_id, applicant_id, status, message, created_at, updated_at
		FROM post_applications
		WHERE applicant_id = ?
		ORDER BY created_at DESC
	`, applicantID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostApplicationRepository) DeleteByPostAndApplicant(ctx context.Context, postID int64, applicantID int64) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM post_applications
		WHERE post_id = ? AND applicant_id = ?
	`, postID, applicantID)
	return err
}

func (r *PostApplicationRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE post_applications
		SET status = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, status, id)
	return err
}

func (r *PostApplicationRepository) CountByPostAndStatus(ctx context.Context, postID int64, status string) (int64, error) {
	var count int64
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*)
		FROM post_applications
		WHERE post_id = ? AND status = ?
	`, postID, status)
	if err != nil {
		return 0, err
	}
	return count, nil
}
