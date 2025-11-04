package service

import (
	"context"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
)

type CatalogService struct {
	seriesRepo   *repository.SeriesRepository
	carClassRepo *repository.CarClassRepository
	carRepo      *repository.CarRepository
	eventRepo    *repository.EventRepository
	trackRepo    *repository.TrackRepository
	languageRepo *repository.UserLanguageRepository
}

func NewCatalogService(
	seriesRepo *repository.SeriesRepository,
	carClassRepo *repository.CarClassRepository,
	carRepo *repository.CarRepository,
	eventRepo *repository.EventRepository,
	trackRepo *repository.TrackRepository,
	languageRepo *repository.UserLanguageRepository,
) *CatalogService {
	return &CatalogService{
		seriesRepo:   seriesRepo,
		carClassRepo: carClassRepo,
		carRepo:      carRepo,
		eventRepo:    eventRepo,
		trackRepo:    trackRepo,
		languageRepo: languageRepo,
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
