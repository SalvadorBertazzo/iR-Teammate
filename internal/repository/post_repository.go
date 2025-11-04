package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type PostRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(ctx context.Context, p *model.Post) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO posts (
			user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		p.UserID, p.Title, p.Body,
		p.EventID, p.SeriesID, p.CarClassID, p.TrackID,
		p.Category, p.MinLicenseLevel, p.MinIRating,
		p.Timezone, p.EventStartAt,
		p.SlotsTotal, p.Status, p.IsPublic, p.ContactHint,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *PostRepository) GetByID(ctx context.Context, id int64) (*model.Post, error) {
	var p model.Post
	err := r.db.GetContext(ctx, &p, `
		SELECT
			id, user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint,
			created_at, updated_at
		FROM posts
		WHERE id = ?
	`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) GetByUserID(ctx context.Context, userID int64) ([]*model.Post, error) {
	var items []*model.Post
	if err := r.db.SelectContext(ctx, &items, `
		SELECT
			id, user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint,
			created_at, updated_at
		FROM posts
		WHERE user_id = ?
		ORDER BY created_at DESC
	`, userID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostRepository) GetPublic(ctx context.Context) ([]*model.Post, error) {
	var items []*model.Post
	if err := r.db.SelectContext(ctx, &items, `
		SELECT
			id, user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint,
			created_at, updated_at
		FROM posts
		WHERE is_public = 1 AND status = 'open'
		ORDER BY created_at DESC
	`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *PostRepository) Update(ctx context.Context, p *model.Post) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE posts
		SET
			title = ?,
			body = ?,
			event_id = ?,
			series_id = ?,
			car_class_id = ?,
			track_id = ?,
			category = ?,
			min_license_level = ?,
			min_irating = ?,
			timezone = ?,
			event_start_at = ?,
			slots_total = ?,
			status = ?,
			is_public = ?,
			contact_hint = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`,
		p.Title,
		p.Body,
		p.EventID,
		p.SeriesID,
		p.CarClassID,
		p.TrackID,
		p.Category,
		p.MinLicenseLevel,
		p.MinIRating,
		p.Timezone,
		p.EventStartAt,
		p.SlotsTotal,
		p.Status,
		p.IsPublic,
		p.ContactHint,
		p.ID,
	)
	return err
}

func (r *PostRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM posts WHERE id = ?`, id)
	return err
}
