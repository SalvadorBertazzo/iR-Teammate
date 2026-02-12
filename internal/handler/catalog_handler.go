package handler

import (
	"net/http"

	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type CatalogHandler struct {
	service *service.CatalogService
}

func NewCatalogHandler(service *service.CatalogService) *CatalogHandler {
	return &CatalogHandler{service: service}
}

// GET /catalogs/series
func (h *CatalogHandler) GetSeries(c echo.Context) error {
	items, err := h.service.GetSeries(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/car-classes
func (h *CatalogHandler) GetCarClasses(c echo.Context) error {
	items, err := h.service.GetCarClasses(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/cars
func (h *CatalogHandler) GetCars(c echo.Context) error {
	items, err := h.service.GetCars(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/events
func (h *CatalogHandler) GetEvents(c echo.Context) error {
	items, err := h.service.GetEvents(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/tracks
func (h *CatalogHandler) GetTracks(c echo.Context) error {
	items, err := h.service.GetTracks(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/languages
func (h *CatalogHandler) GetLanguages(c echo.Context) error {
	items, err := h.service.GetLanguages(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// GET /catalogs/relationships
func (h *CatalogHandler) GetRelationships(c echo.Context) error {
	rels, err := h.service.GetRelationships(c.Request().Context())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, rels)
}
