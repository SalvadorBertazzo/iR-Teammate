package handler

import (
	"fmt"
	"net/http"

	"iR-Teammate/internal/model"
	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type ProfileHandler struct {
	service *service.ProfileService
}

func NewProfileHandler(service *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		service: service,
	}
}

// GET /profile/iracing/:id - get iRacing profile by user ID
func (h *ProfileHandler) GetUserIRacingProfile(c echo.Context) error {
	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "user id is required"})
	}

	var userID int64
	if _, err := fmt.Sscan(idParam, &userID); err != nil || userID <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
	}

	profile, err := h.service.GetUserIRacing(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if profile == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "profile not found"})
	}

	return c.JSON(http.StatusOK, profile)
}

// GET /profile/iracing - get current user's iRacing profile
func (h *ProfileHandler) GetIRacingProfile(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	profile, err := h.service.GetUserIRacing(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if profile == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "profile not found"})
	}

	return c.JSON(http.StatusOK, profile)
}

// PUT /profile/iracing - update iRacing profile
func (h *ProfileHandler) UpdateIRacingProfile(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	var updateData model.UserIRacing
	if err := c.Bind(&updateData); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	updated, err := h.service.UpdateUserIRacing(c.Request().Context(), userID, &updateData)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updated)
}

// GET /profile/iracing/licenses - get all licenses for current user
func (h *ProfileHandler) GetLicenses(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	licenses, err := h.service.GetLicenses(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, licenses)
}

// PUT /profile/iracing/licenses - create or update a license
func (h *ProfileHandler) UpsertLicense(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	var licenseData model.UserIRacingLicense
	if err := c.Bind(&licenseData); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if licenseData.Category == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "category is required"})
	}
	if licenseData.LicenseLevel == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "license_level is required"})
	}

	updated, err := h.service.UpsertLicense(c.Request().Context(), userID, &licenseData)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updated)
}

// GET /profile/iracing/languages - get all languages for current user
func (h *ProfileHandler) GetLanguages(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	languages, err := h.service.GetLanguages(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, languages)
}

// PUT /profile/iracing/languages - update user languages (replaces entire list)
func (h *ProfileHandler) UpsertLanguages(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid user_id"})
	}

	var requestBody struct {
		Languages []string `json:"languages"`
	}
	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if err := h.service.UpsertLanguages(c.Request().Context(), userID, requestBody.Languages); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	languages, err := h.service.GetLanguages(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, languages)
}

// GET /languages - get all available languages catalog
func (h *ProfileHandler) GetAllLanguages(c echo.Context) error {
	languages, err := h.service.GetAllLanguages(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, languages)
}
