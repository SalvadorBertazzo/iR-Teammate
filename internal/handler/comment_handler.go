package handler

import (
	"fmt"
	"net/http"
	"strings"

	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type CommentHandler struct {
	service *service.CommentService
}

func NewCommentHandler(service *service.CommentService) *CommentHandler {
	return &CommentHandler{service: service}
}

func parseCommentsExpand(expandParam string) map[string]bool {
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

type createCommentRequest struct {
	Body string `json:"body"`
}

func (h *CommentHandler) CreateRoot(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	var req createCommentRequest
	if err := c.Bind(&req); err != nil || strings.TrimSpace(req.Body) == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	dtoItem, err := h.service.CreateRoot(c.Request().Context(), postID, userID, req.Body)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusCreated, dtoItem)
}

func (h *CommentHandler) CreateReply(c echo.Context) error {
	var postID, parentID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	if _, err := fmt.Sscan(c.Param("comment_id"), &parentID); err != nil || parentID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	var req createCommentRequest
	if err := c.Bind(&req); err != nil || strings.TrimSpace(req.Body) == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	dtoItem, err := h.service.CreateReply(c.Request().Context(), postID, parentID, userID, req.Body)
	if err != nil {
		if err == service.ErrNotFound {
			return c.NoContent(http.StatusNotFound)
		}
		if err == service.ErrInvalidDepth {
			return c.String(http.StatusBadRequest, err.Error())
		}
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusCreated, dtoItem)
}

func (h *CommentHandler) ListByPost(c echo.Context) error {
	var postID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	expand := parseCommentsExpand(c.QueryParam("expand"))
	items, err := h.service.ListByPost(c.Request().Context(), postID, expand)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (h *CommentHandler) Delete(c echo.Context) error {
	var postID, commentID int64
	if _, err := fmt.Sscan(c.Param("id"), &postID); err != nil || postID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	if _, err := fmt.Sscan(c.Param("comment_id"), &commentID); err != nil || commentID <= 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	ok, err := h.service.SoftDelete(c.Request().Context(), commentID, userID)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if !ok {
		return c.NoContent(http.StatusForbidden)
	}
	return c.NoContent(http.StatusNoContent)
}
