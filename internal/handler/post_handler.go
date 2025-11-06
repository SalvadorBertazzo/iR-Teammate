package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"iR-Teammate/internal/dto"
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

// parsePostFilters parses query parameters into PostFilters
func parsePostFilters(c echo.Context) dto.PostFilters {
	filters := dto.PostFilters{}

	// Text search
	if search := c.QueryParam("search"); search != "" {
		filters.Search = strings.TrimSpace(search)
	}

	// Category (comma-separated)
	if categoryParam := c.QueryParam("category"); categoryParam != "" {
		parts := strings.Split(categoryParam, ",")
		categories := make([]string, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				categories = append(categories, trimmed)
			}
		}
		if len(categories) > 0 {
			filters.Category = categories
		}
	}

	// iRating range
	if minIRatingStr := c.QueryParam("min_irating"); minIRatingStr != "" {
		if val, err := strconv.Atoi(minIRatingStr); err == nil {
			filters.MinIRating = &val
		}
	}
	if maxIRatingStr := c.QueryParam("max_irating"); maxIRatingStr != "" {
		if val, err := strconv.Atoi(maxIRatingStr); err == nil {
			filters.MaxIRating = &val
		}
	}

	// License level
	if minLicenseLevel := c.QueryParam("min_license_level"); minLicenseLevel != "" {
		filters.MinLicenseLevel = strings.TrimSpace(minLicenseLevel)
	}

	// Series IDs (comma-separated)
	if seriesIDsParam := c.QueryParam("series_ids"); seriesIDsParam != "" {
		parts := strings.Split(seriesIDsParam, ",")
		seriesIDs := make([]int64, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				if val, err := strconv.ParseInt(trimmed, 10, 64); err == nil {
					seriesIDs = append(seriesIDs, val)
				}
			}
		}
		if len(seriesIDs) > 0 {
			filters.SeriesIDs = seriesIDs
		}
	}

	// Car IDs (comma-separated)
	if carIDsParam := c.QueryParam("car_ids"); carIDsParam != "" {
		parts := strings.Split(carIDsParam, ",")
		carIDs := make([]int64, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				if val, err := strconv.ParseInt(trimmed, 10, 64); err == nil {
					carIDs = append(carIDs, val)
				}
			}
		}
		if len(carIDs) > 0 {
			filters.CarIDs = carIDs
		}
	}

	// Track IDs (comma-separated)
	if trackIDsParam := c.QueryParam("track_ids"); trackIDsParam != "" {
		parts := strings.Split(trackIDsParam, ",")
		trackIDs := make([]int64, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				if val, err := strconv.ParseInt(trimmed, 10, 64); err == nil {
					trackIDs = append(trackIDs, val)
				}
			}
		}
		if len(trackIDs) > 0 {
			filters.TrackIDs = trackIDs
		}
	}

	// Timezone
	if timezone := c.QueryParam("timezone"); timezone != "" {
		filters.Timezone = strings.TrimSpace(timezone)
	}

	// Status (comma-separated)
	if statusParam := c.QueryParam("status"); statusParam != "" {
		parts := strings.Split(statusParam, ",")
		statuses := make([]string, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				statuses = append(statuses, trimmed)
			}
		}
		if len(statuses) > 0 {
			filters.Status = statuses
		}
	}

	// Event date range
	if eventStartFromStr := c.QueryParam("event_start_from"); eventStartFromStr != "" {
		if t, err := time.Parse(time.RFC3339, eventStartFromStr); err == nil {
			filters.EventStartFrom = &t
		}
	}
	if eventStartToStr := c.QueryParam("event_start_to"); eventStartToStr != "" {
		if t, err := time.Parse(time.RFC3339, eventStartToStr); err == nil {
			filters.EventStartTo = &t
		}
	}

	// Sorting
	if sortBy := c.QueryParam("sort_by"); sortBy != "" {
		filters.SortBy = strings.TrimSpace(sortBy)
	}
	if sortOrder := c.QueryParam("sort_order"); sortOrder != "" {
		filters.SortOrder = strings.TrimSpace(sortOrder)
	}

	// Pagination
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			filters.Limit = val
		}
	}
	if offsetStr := c.QueryParam("offset"); offsetStr != "" {
		if val, err := strconv.Atoi(offsetStr); err == nil && val >= 0 {
			filters.Offset = val
		}
	}

	return filters
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
	// Parse filters from query parameters
	filters := parsePostFilters(c)
	expand := parseExpand(c.QueryParam("expand"))

	// Use SearchPostsDTO with parsed filters
	response, err := h.service.SearchPostsDTO(c.Request().Context(), filters, expand)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, response)
}

// ListMine lists posts owned by the current user (JWT required)
func (h *PostHandler) ListMine(c echo.Context) error {
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	filters := parsePostFilters(c)
	filters.UserID = &userID

	expand := parseExpand(c.QueryParam("expand"))

	response, err := h.service.SearchPostsDTO(c.Request().Context(), filters, expand)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, response)
}
