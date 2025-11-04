package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type CarClassRepository struct {
	db *sqlx.DB
}

func NewCarClassRepository(db *sqlx.DB) *CarClassRepository {
	return &CarClassRepository{db: db}
}

func (r *CarClassRepository) GetAll(ctx context.Context) ([]*model.CarClass, error) {
	var items []*model.CarClass
	if err := r.db.SelectContext(ctx, &items, `SELECT id, name FROM car_classes ORDER BY name ASC`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CarClassRepository) GetByID(ctx context.Context, id int64) (*model.CarClass, error) {
	var item model.CarClass
	err := r.db.GetContext(ctx, &item, `SELECT id, name FROM car_classes WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
