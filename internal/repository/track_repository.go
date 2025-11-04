package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type TrackRepository struct {
	db *sqlx.DB
}

func NewTrackRepository(db *sqlx.DB) *TrackRepository {
	return &TrackRepository{db: db}
}

func (r *TrackRepository) GetAll(ctx context.Context) ([]*model.Track, error) {
	var items []*model.Track
	if err := r.db.SelectContext(ctx, &items, `SELECT id, name FROM tracks ORDER BY name ASC`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *TrackRepository) GetByID(ctx context.Context, id int64) (*model.Track, error) {
	var item model.Track
	err := r.db.GetContext(ctx, &item, `SELECT id, name FROM tracks WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
