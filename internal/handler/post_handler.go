package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"iR-Teammate/internal/model"
	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type PostHandler struct {
	service *service.PostService
}

func NewPostHandler(service *service.PostService) *PostHandler {
	return &PostHandler{service: service}
}

// parseExpand parses ?expand=event,series,car_class,track,cars,languages into a map
func parseExpand(expandParam string) map[string]bool {
	if expandParam == "" {
		return nil
	}
	expand := make(map[string]bool)
	parts := strings.Split(expandParam, ",")
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			expand[trimmed] = true
		}
	}
	return expand
}

// DTOs for requests

type createPostRequest struct {
	Title           string     `json:"title"`
	Body            string     `json:"body"`
	EventID         *int64     `json:"event_id"`
	SeriesID        *int64     `json:"series_id"`
	CarClassID      *int64     `json:"car_class_id"`
	TrackID         *int64     `json:"track_id"`
	Category        string     `json:"category"`
	MinLicenseLevel string     `json:"min_license_level"`
	MinIRating      int        `json:"min_irating"`
	Timezone        string     `json:"timezone"`
	EventStartAt    *time.Time `json:"event_start_at"`
	SlotsTotal      int        `json:"slots_total"`
	Status          string     `json:"status"`
	IsPublic        bool       `json:"is_public"`
	ContactHint     string     `json:"contact_hint"`
	CarIDs          []int64    `json:"car_ids"`
	LanguageCodes   []string   `json:"language_codes"`
}

type updatePostRequest struct {
	Title           string     `json:"title"`
	Body            string     `json:"body"`
	EventID         *int64     `json:"event_id"`
	SeriesID        *int64     `json:"series_id"`
	CarClassID      *int64     `json:"car_class_id"`
	TrackID         *int64     `json:"track_id"`
	Category        string     `json:"category"`
	MinLicenseLevel string     `json:"min_license_level"`
	MinIRating      int        `json:"min_irating"`
	Timezone        string     `json:"timezone"`
	EventStartAt    *time.Time `json:"event_start_at"`
	SlotsTotal      int        `json:"slots_total"`
	Status          string     `json:"status"`
	IsPublic        bool       `json:"is_public"`
	ContactHint     string     `json:"contact_hint"`
	CarIDs          []int64    `json:"car_ids"`
	LanguageCodes   []string   `json:"language_codes"`
}

func (h *PostHandler) Create(c echo.Context) error {
	var req createPostRequest
	if err := c.Bind(&req); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	post := &model.Post{
		Title:           req.Title,
		Body:            req.Body,
		EventID:         req.EventID,
		SeriesID:        req.SeriesID,
		CarClassID:      req.CarClassID,
		TrackID:         req.TrackID,
		Category:        req.Category,
		MinLicenseLevel: req.MinLicenseLevel,
		MinIRating:      req.MinIRating,
		Timezone:        req.Timezone,
		EventStartAt:    req.EventStartAt,
		SlotsTotal:      req.SlotsTotal,
		Status:          req.Status,
		IsPublic:        req.IsPublic,
		ContactHint:     req.ContactHint,
	}

	created, err := h.service.CreatePost(c.Request().Context(), userID, post, req.CarIDs, req.LanguageCodes)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	expand := parseExpand(c.QueryParam("expand"))
	dtoItem, derr := h.service.GetPostDTO(c.Request().Context(), created.ID, expand)
	if derr != nil {
		return c.String(http.StatusBadRequest, derr.Error())
	}
	return c.JSON(http.StatusCreated, dtoItem)
}

func (h *PostHandler) Update(c echo.Context) error {
	var req updatePostRequest
	if err := c.Bind(&req); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// id from URL
	idParam := c.Param("id")
	if idParam == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	post := &model.Post{
		ID:              id,
		Title:           req.Title,
		Body:            req.Body,
		EventID:         req.EventID,
		SeriesID:        req.SeriesID,
		CarClassID:      req.CarClassID,
		TrackID:         req.TrackID,
		Category:        req.Category,
		MinLicenseLevel: req.MinLicenseLevel,
		MinIRating:      req.MinIRating,
		Timezone:        req.Timezone,
		EventStartAt:    req.EventStartAt,
		SlotsTotal:      req.SlotsTotal,
		Status:          req.Status,
		IsPublic:        req.IsPublic,
		ContactHint:     req.ContactHint,
	}

	_, err := h.service.UpdatePost(c.Request().Context(), userID, post, req.CarIDs, req.LanguageCodes)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	// Return DTO after update for unified response shape
	expand := parseExpand(c.QueryParam("expand"))
	dtoItem, derr := h.service.GetPostDTO(c.Request().Context(), id, expand)
	if derr != nil {
		return c.String(http.StatusBadRequest, derr.Error())
	}
	return c.JSON(http.StatusOK, dtoItem)
}

func (h *PostHandler) Get(c echo.Context) error {
	idParam := c.Param("id")
	if idParam == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	expand := parseExpand(c.QueryParam("expand"))
	post, err := h.service.GetPostDTO(c.Request().Context(), id, expand)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if post == nil {
		return c.NoContent(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, post)
}

func (h *PostHandler) Delete(c echo.Context) error {
	idParam := c.Param("id")
	if idParam == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	if err := h.service.DeletePost(c.Request().Context(), userID, id); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *PostHandler) ListPublic(c echo.Context) error {
	expand := parseExpand(c.QueryParam("expand"))
	items, err := h.service.ListPublicDTO(c.Request().Context(), expand)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}

// ListMine lists posts owned by the current user (JWT required)
func (h *PostHandler) ListMine(c echo.Context) error {
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	expand := parseExpand(c.QueryParam("expand"))
	items, err := h.service.ListByUserDTO(c.Request().Context(), userID, expand)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, items)
}
