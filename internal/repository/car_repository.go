package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type CarRepository struct {
	db *sqlx.DB
}

func NewCarRepository(db *sqlx.DB) *CarRepository {
	return &CarRepository{db: db}
}

func (r *CarRepository) GetAll(ctx context.Context) ([]*model.Car, error) {
	var items []*model.Car
	if err := r.db.SelectContext(ctx, &items, `SELECT id, name FROM cars ORDER BY name ASC`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CarRepository) GetByID(ctx context.Context, id int64) (*model.Car, error) {
	var item model.Car
	err := r.db.GetContext(ctx, &item, `SELECT id, name FROM cars WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
