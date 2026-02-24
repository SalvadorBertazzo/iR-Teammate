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

	// License level (single min threshold - legacy)
	if minLicenseLevel := c.QueryParam("min_license_level"); minLicenseLevel != "" {
		filters.MinLicenseLevel = strings.TrimSpace(minLicenseLevel)
	}

	// License levels (comma-separated, multi-select)
	if licenseLevelsParam := c.QueryParam("license_levels"); licenseLevelsParam != "" {
		parts := strings.Split(licenseLevelsParam, ",")
		levels := make([]string, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				levels = append(levels, trimmed)
			}
		}
		if len(levels) > 0 {
			filters.LicenseLevels = levels
		}
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

	// Car Class IDs (comma-separated)
	if carClassIDsParam := c.QueryParam("car_class_ids"); carClassIDsParam != "" {
		parts := strings.Split(carClassIDsParam, ",")
		carClassIDs := make([]int64, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				if val, err := strconv.ParseInt(trimmed, 10, 64); err == nil {
					carClassIDs = append(carClassIDs, val)
				}
			}
		}
		if len(carClassIDs) > 0 {
			filters.CarClassIDs = carClassIDs
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

	// Language codes (comma-separated)
	if langCodesParam := c.QueryParam("language_codes"); langCodesParam != "" {
		parts := strings.Split(langCodesParam, ",")
		codes := make([]string, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				codes = append(codes, trimmed)
			}
		}
		if len(codes) > 0 {
			filters.LanguageCodes = codes
		}
	}

	// Event IDs (comma-separated)
	if eventIDsParam := c.QueryParam("event_ids"); eventIDsParam != "" {
		parts := strings.Split(eventIDsParam, ",")
		eventIDs := make([]int64, 0, len(parts))
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				if val, err := strconv.ParseInt(trimmed, 10, 64); err == nil {
					eventIDs = append(eventIDs, val)
				}
			}
		}
		if len(eventIDs) > 0 {
			filters.EventIDs = eventIDs
		}
	}

	// Has event (boolean: "true" or "false")
	if hasEventParam := c.QueryParam("has_event"); hasEventParam != "" {
		val := hasEventParam == "true" || hasEventParam == "1"
		filters.HasEvent = &val
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
	Category        string     `json:"category"`
	Categories      []string   `json:"categories"`
	SeriesIDs       []int64    `json:"series_ids"`
	CarClassIDs     []int64    `json:"car_class_ids"`
	CarIDs          []int64    `json:"car_ids"`
	TrackIDs        []int64    `json:"track_ids"`
	MinLicenseLevel string     `json:"min_license_level"`
	MinIRating      int        `json:"min_irating"`
	Timezone        string     `json:"timezone"`
	EventStartAt    *time.Time `json:"event_start_at"`
	SlotsTotal      int        `json:"slots_total"`
	Status          string     `json:"status"`
	IsPublic        bool       `json:"is_public"`
	ContactHint     string     `json:"contact_hint"`
	LanguageCodes   []string   `json:"language_codes"`
}

type updatePostRequest struct {
	Title           string     `json:"title"`
	Body            string     `json:"body"`
	EventID         *int64     `json:"event_id"`
	Category        string     `json:"category"`
	Categories      []string   `json:"categories"`
	SeriesIDs       []int64    `json:"series_ids"`
	CarClassIDs     []int64    `json:"car_class_ids"`
	CarIDs          []int64    `json:"car_ids"`
	TrackIDs        []int64    `json:"track_ids"`
	MinLicenseLevel string     `json:"min_license_level"`
	MinIRating      int        `json:"min_irating"`
	Timezone        string     `json:"timezone"`
	EventStartAt    *time.Time `json:"event_start_at"`
	SlotsTotal      int        `json:"slots_total"`
	Status          string     `json:"status"`
	IsPublic        *bool      `json:"is_public"`
	ContactHint     string     `json:"contact_hint"`
	LanguageCodes   []string   `json:"language_codes"`
}

func (h *PostHandler) Create(c echo.Context) error {
	var req createPostRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if strings.TrimSpace(req.Title) == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "title is required"})
	}
	if strings.TrimSpace(req.Body) == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "body is required"})
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	// Determine categories: prefer multi-select, fall back to legacy single
	categories := req.Categories
	if len(categories) == 0 && req.Category != "" {
		categories = []string{req.Category}
	}

	post := &model.Post{
		Title:           req.Title,
		Body:            req.Body,
		EventID:         req.EventID,
		Category:        req.Category,
		MinLicenseLevel: req.MinLicenseLevel,
		MinIRating:      req.MinIRating,
		Timezone:        req.Timezone,
		EventStartAt:    req.EventStartAt,
		SlotsTotal:      req.SlotsTotal,
		Status:          "open",
		IsPublic:        req.IsPublic,
		ContactHint:     req.ContactHint,
	}

	created, err := h.service.CreatePost(
		c.Request().Context(), userID, post,
		categories, req.SeriesIDs, req.CarClassIDs,
		req.CarIDs, req.TrackIDs, req.LanguageCodes,
	)
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
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing post id"})
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	// Fetch existing post to use as base for partial updates
	existing, err := h.service.GetPost(c.Request().Context(), id)
	if err != nil || existing == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "post not found"})
	}

	// Merge: use request values if provided, otherwise keep existing
	isPublic := existing.IsPublic
	if req.IsPublic != nil {
		isPublic = *req.IsPublic
	}

	post := &model.Post{
		ID:              id,
		Title:           orStr(req.Title, existing.Title),
		Body:            orStr(req.Body, existing.Body),
		EventID:         req.EventID,
		Category:        orStr(req.Category, existing.Category),
		MinLicenseLevel: orStr(req.MinLicenseLevel, existing.MinLicenseLevel),
		MinIRating:      orInt(req.MinIRating, existing.MinIRating),
		Timezone:        orStr(req.Timezone, existing.Timezone),
		EventStartAt:    req.EventStartAt,
		SlotsTotal:      orIntPositive(req.SlotsTotal, existing.SlotsTotal),
		Status:          orStr(req.Status, existing.Status),
		IsPublic:        isPublic,
		ContactHint:     orStr(req.ContactHint, existing.ContactHint),
	}

	// If event_id was not sent, keep existing
	if req.EventID == nil {
		post.EventID = existing.EventID
	}
	// If event_start_at was not sent, keep existing
	if req.EventStartAt == nil {
		post.EventStartAt = existing.EventStartAt
	}

	// Determine categories: prefer multi-select, fall back to legacy single
	categories := req.Categories
	if len(categories) == 0 && req.Category != "" {
		categories = []string{req.Category}
	}

	_, err = h.service.UpdatePost(
		c.Request().Context(), userID, post,
		categories, req.SeriesIDs, req.CarClassIDs,
		req.CarIDs, req.TrackIDs, req.LanguageCodes,
	)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	expand := parseExpand(c.QueryParam("expand"))
	dtoItem, derr := h.service.GetPostDTO(c.Request().Context(), id, expand)
	if derr != nil {
		return c.String(http.StatusBadRequest, derr.Error())
	}
	return c.JSON(http.StatusOK, dtoItem)
}

func orStr(val, fallback string) string {
	if val != "" {
		return val
	}
	return fallback
}

func orInt(val, fallback int) int {
	if val != 0 {
		return val
	}
	return fallback
}

func orIntPositive(val, fallback int) int {
	if val > 0 {
		return val
	}
	return fallback
}

func (h *PostHandler) Get(c echo.Context) error {
	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing post id"})
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}
	expand := parseExpand(c.QueryParam("expand"))
	post, err := h.service.GetPostDTO(c.Request().Context(), id, expand)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if post == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "post not found"})
	}
	return c.JSON(http.StatusOK, post)
}

func (h *PostHandler) Delete(c echo.Context) error {
	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing post id"})
	}
	var id int64
	if _, err := fmt.Sscan(idParam, &id); err != nil || id <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	if err := h.service.DeletePost(c.Request().Context(), userID, id); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *PostHandler) ListPublic(c echo.Context) error {
	filters := parsePostFilters(c)
	expand := parseExpand(c.QueryParam("expand"))

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
