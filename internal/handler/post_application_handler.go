package handler

import (
	"fmt"
	"net/http"
	"strings"

	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type PostApplicationHandler struct {
	service *service.PostApplicationService
}

func NewPostApplicationHandler(service *service.PostApplicationService) *PostApplicationHandler {
	return &PostApplicationHandler{service: service}
}

// parseExpand parses ?expand=applicant,post into a map
func parseApplicationExpand(expandParam string) map[string]bool {
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

type createApplicationRequest struct {
	Message string `json:"message"`
}

// Create creates a new application to a post
// POST /posts/:id/applications
func (h *PostApplicationHandler) Create(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	var req createApplicationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	dtoItem, err := h.service.CreateApplication(c.Request().Context(), postID, userID, req.Message)
	if err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrPostNotOpen {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		if err == service.ErrCannotApplyToOwnPost {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		if err == service.ErrApplicationAlreadyExists {
			return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, dtoItem)
}

// GetByID returns an application by ID (nested under post)
// GET /posts/:id/applications/:application_id
func (h *PostApplicationHandler) GetByID(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	var applicationID int64
	if _, err := fmt.Sscan(c.Param("application_id"), &applicationID); err != nil || applicationID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid application id"})
	}

	expand := parseApplicationExpand(c.QueryParam("expand"))

	dtoItem, err := h.service.GetApplicationByID(c.Request().Context(), applicationID, expand)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if dtoItem == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "application not found"})
	}

	// Validate that the application belongs to the post
	if dtoItem.PostID != postID {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "application not found for this post"})
	}

	return c.JSON(http.StatusOK, dtoItem)
}

// ListByPost returns all applications for a post (only owner can see)
// GET /posts/:id/applications?status=pending (status is optional)
func (h *PostApplicationHandler) ListByPost(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	expand := parseApplicationExpand(c.QueryParam("expand"))

	// Check if status filter is provided
	status := c.QueryParam("status")
	if status != "" {
		// Validate status
		if status != "pending" && status != "accepted" && status != "rejected" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid status (must be pending, accepted, or rejected)"})
		}
		// Use filtered method
		items, err := h.service.ListByPostAndStatus(c.Request().Context(), postID, status, userID, expand)
		if err != nil {
			if err == service.ErrPostNotFound {
				return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
			}
			if err == service.ErrForbidden {
				return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
			}
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, items)
	}

	// No status filter, get all applications
	items, err := h.service.ListByPost(c.Request().Context(), postID, userID, expand)
	if err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, items)
}

// ListByApplicant returns all applications made by the authenticated user
// GET /applications/mine
func (h *PostApplicationHandler) ListByApplicant(c echo.Context) error {
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	expand := parseApplicationExpand(c.QueryParam("expand"))

	items, err := h.service.ListByApplicant(c.Request().Context(), userID, expand)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, items)
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

// UpdateStatus updates the status of an application (accept/reject)
// PATCH /posts/:id/applications/:application_id/status
func (h *PostApplicationHandler) UpdateStatus(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	var applicationID int64
	if _, err := fmt.Sscan(c.Param("application_id"), &applicationID); err != nil || applicationID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid application id"})
	}

	var req updateStatusRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Status != "accepted" && req.Status != "rejected" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid status (must be 'accepted' or 'rejected')"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	dtoItem, err := h.service.UpdateStatus(c.Request().Context(), applicationID, req.Status, userID)
	if err != nil {
		if err == service.ErrApplicationNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrApplicationNotPending {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Validate that the application belongs to the post
	if dtoItem.PostID != postID {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "application not found for this post"})
	}

	return c.JSON(http.StatusOK, dtoItem)
}

// CountByPostAndStatus returns the count of applications for a post by status
// GET /posts/:id/applications/count?status=pending
func (h *PostApplicationHandler) CountByPostAndStatus(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	status := c.QueryParam("status")
	if status == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "status parameter is required"})
	}
	if status != "pending" && status != "accepted" && status != "rejected" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid status (must be pending, accepted, or rejected)"})
	}

	count, err := h.service.CountByPostAndStatus(c.Request().Context(), postID, status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"post_id": postID,
		"status":  status,
		"count":   count,
	})
}
