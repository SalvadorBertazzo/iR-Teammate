package repository

import (
	"context"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type CatalogRelationshipRepository struct {
	db *sqlx.DB
}

func NewCatalogRelationshipRepository(db *sqlx.DB) *CatalogRelationshipRepository {
	return &CatalogRelationshipRepository{db: db}
}

func (r *CatalogRelationshipRepository) GetAllSeriesCategories(ctx context.Context) ([]*model.SeriesCategory, error) {
	var items []*model.SeriesCategory
	if err := r.db.SelectContext(ctx, &items, `
		SELECT series_id, category
		FROM series_categories
		ORDER BY series_id, category
	`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CatalogRelationshipRepository) GetAllSeriesCarClasses(ctx context.Context) ([]*model.SeriesCarClass, error) {
	var items []*model.SeriesCarClass
	if err := r.db.SelectContext(ctx, &items, `
		SELECT series_id, car_class_id
		FROM series_car_classes
		ORDER BY series_id, car_class_id
	`); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CatalogRelationshipRepository) GetAllCarClassCars(ctx context.Context) ([]*model.CarClassCar, error) {
	var items []*model.CarClassCar
	if err := r.db.SelectContext(ctx, &items, `
		SELECT car_class_id, car_id
		FROM car_class_cars
		ORDER BY car_class_id, car_id
	`); err != nil {
		return nil, err
	}
	return items, nil
}
