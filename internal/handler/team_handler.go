package handler

import (
	"fmt"
	"net/http"

	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type TeamHandler struct {
	service *service.TeamService
}

func NewTeamHandler(service *service.TeamService) *TeamHandler {
	return &TeamHandler{service: service}
}

// DeleteTeam deletes the team (the post) — only the owner can do this
// DELETE /posts/:id/team
func (h *TeamHandler) DeleteTeam(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	if err := h.service.DeleteTeam(c.Request().Context(), postID, userID); err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// RemoveMember removes a member from the team (or lets a member leave)
// DELETE /posts/:id/team/members/:user_id
func (h *TeamHandler) RemoveMember(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	var targetUserID int64
	if _, err := fmt.Sscan(c.Param("user_id"), &targetUserID); err != nil || targetUserID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
	}

	userIDAny := c.Get("user_id")
	requestingUserID, _ := userIDAny.(int64)

	if err := h.service.RemoveMember(c.Request().Context(), postID, targetUserID, requestingUserID); err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// GetMyTeams returns all teams the current user belongs to
// GET /teams/mine
func (h *TeamHandler) GetMyTeams(c echo.Context) error {
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	teams, err := h.service.GetMyTeams(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, teams)
}

// GetTeam returns team info (members list) for a post
// GET /posts/:id/team
func (h *TeamHandler) GetTeam(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	team, err := h.service.GetTeam(c.Request().Context(), postID, userID)
	if err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, team)
}

// ListMessages returns chat messages for a team
// GET /posts/:id/team/messages?after=<id>
func (h *TeamHandler) ListMessages(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	var afterID int64
	if after := c.QueryParam("after"); after != "" {
		fmt.Sscan(after, &afterID)
	}

	messages, err := h.service.ListMessages(c.Request().Context(), postID, userID, afterID)
	if err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, messages)
}

type createMessageRequest struct {
	Body string `json:"body"`
}

// CreateMessage sends a message in the team chat
// POST /posts/:id/team/messages
func (h *TeamHandler) CreateMessage(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid post id"})
	}

	var req createMessageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Body == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "message body cannot be empty"})
	}

	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)

	msg, err := h.service.CreateMessage(c.Request().Context(), postID, userID, req.Body)
	if err != nil {
		if err == service.ErrPostNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, msg)
}
