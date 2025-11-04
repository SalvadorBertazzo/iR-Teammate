package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type SeriesRepository struct {
	db *sqlx.DB
}

func NewSeriesRepository(db *sqlx.DB) *SeriesRepository {
	return &SeriesRepository{db: db}
}

func (r *SeriesRepository) GetAll(ctx context.Context) ([]*model.Series, error) {
	var items []*model.Series
	if err := r.db.SelectContext(ctx, &items, `SELECT id, name FROM series ORDER BY name ASC`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *SeriesRepository) GetByID(ctx context.Context, id int64) (*model.Series, error) {
	var item model.Series
	err := r.db.GetContext(ctx, &item, `SELECT id, name FROM series WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
