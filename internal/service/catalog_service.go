package service

import (
	"context"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
)

type CatalogRelationshipsDTO struct {
	SeriesCategories []*model.SeriesCategory `json:"series_categories"`
	SeriesCarClasses []*model.SeriesCarClass  `json:"series_car_classes"`
	CarClassCars     []*model.CarClassCar     `json:"car_class_cars"`
}

type CatalogService struct {
	seriesRepo   *repository.SeriesRepository
	carClassRepo *repository.CarClassRepository
	carRepo      *repository.CarRepository
	eventRepo    *repository.EventRepository
	trackRepo    *repository.TrackRepository
	languageRepo *repository.UserLanguageRepository
	relRepo      *repository.CatalogRelationshipRepository
}

func NewCatalogService(
	seriesRepo *repository.SeriesRepository,
	carClassRepo *repository.CarClassRepository,
	carRepo *repository.CarRepository,
	eventRepo *repository.EventRepository,
	trackRepo *repository.TrackRepository,
	languageRepo *repository.UserLanguageRepository,
	relRepo *repository.CatalogRelationshipRepository,
) *CatalogService {
	return &CatalogService{
		seriesRepo:   seriesRepo,
		carClassRepo: carClassRepo,
		carRepo:      carRepo,
		eventRepo:    eventRepo,
		trackRepo:    trackRepo,
		languageRepo: languageRepo,
		relRepo:      relRepo,
	}
}

func (s *CatalogService) GetSeries(ctx context.Context) ([]*model.Series, error) {
	return s.seriesRepo.GetAll(ctx)
}

func (s *CatalogService) GetCarClasses(ctx context.Context) ([]*model.CarClass, error) {
	return s.carClassRepo.GetAll(ctx)
}

func (s *CatalogService) GetCars(ctx context.Context) ([]*model.Car, error) {
	return s.carRepo.GetAll(ctx)
}

func (s *CatalogService) GetEvents(ctx context.Context) ([]*model.Event, error) {
	return s.eventRepo.GetAll(ctx)
}

func (s *CatalogService) GetTracks(ctx context.Context) ([]*model.Track, error) {
	return s.trackRepo.GetAll(ctx)
}

func (s *CatalogService) GetLanguages(ctx context.Context) ([]*model.Language, error) {
	return s.languageRepo.GetAllLanguages(ctx)
}

func (s *CatalogService) GetRelationships(ctx context.Context) (*CatalogRelationshipsDTO, error) {
	seriesCategories, err := s.relRepo.GetAllSeriesCategories(ctx)
	if err != nil {
		return nil, err
	}
	seriesCarClasses, err := s.relRepo.GetAllSeriesCarClasses(ctx)
	if err != nil {
		return nil, err
	}
	carClassCars, err := s.relRepo.GetAllCarClassCars(ctx)
	if err != nil {
		return nil, err
	}
	return &CatalogRelationshipsDTO{
		SeriesCategories: seriesCategories,
		SeriesCarClasses: seriesCarClasses,
		CarClassCars:     carClassCars,
	}, nil
}
