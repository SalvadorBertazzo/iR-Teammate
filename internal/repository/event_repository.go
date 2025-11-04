package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type EventRepository struct {
	db *sqlx.DB
}

func NewEventRepository(db *sqlx.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetAll(ctx context.Context) ([]*model.Event, error) {
	var items []*model.Event
	if err := r.db.SelectContext(ctx, &items, `SELECT id, name FROM events ORDER BY name ASC`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *EventRepository) GetByID(ctx context.Context, id int64) (*model.Event, error) {
	var item model.Event
	err := r.db.GetContext(ctx, &item, `SELECT id, name FROM events WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
