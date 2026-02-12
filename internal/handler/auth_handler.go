package handler

import (
	"fmt"
	"net/http"
	"time"

	"iR-Teammate/internal/service"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// GET /auth/discord/login
func (h *AuthHandler) DiscordLogin(c echo.Context) error {
	res, err := h.service.StartDiscordLogin()
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	// Save state in cookie (anti-CSRF)
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    res.State,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   300, // 5 minutes
		// In production: Secure: true,
	})

	return c.Redirect(http.StatusFound, res.RedirectURL)
}

// GET /auth/discord/callback
func (h *AuthHandler) DiscordCallback(c echo.Context) error {
	qState := c.QueryParam("state")
	cookie, err := c.Cookie("oauth_state")
	if err != nil || cookie == nil || cookie.Value == "" {
		return c.String(http.StatusBadRequest, "missing state")
	}

	code := c.QueryParam("code")
	if code == "" {
		return c.String(http.StatusBadRequest, "missing code")
	}

	// Process callback in the service (validate state, token, upsert user, generate JWT)
	jwt, err := h.service.HandleDiscordCallback(c.Request().Context(), code, qState, cookie.Value)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Invalidate state cookie
	cookie.MaxAge = -1
	cookie.Expires = time.Unix(0, 0)
	cookie.Value = ""
	c.SetCookie(cookie)

	// Set session cookie with the JWT
	c.SetCookie(&http.Cookie{
		Name:     "session",
		Value:    jwt,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		// In production: Secure: true,
	})

	return c.Redirect(http.StatusFound, "/")
}

// GET /me - show the logged in user info (requires JWT middleware)
func (h *AuthHandler) Me(c echo.Context) error {
	userIDAny := c.Get("user_id")
	userID, _ := userIDAny.(int64)
	discordIDAny := c.Get("discord_id")
	discordID, _ := discordIDAny.(string)

	// Get basic user info (username only, no iRacing profile)
	user, err := h.service.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	resp := map[string]interface{}{
		"user_id":    userID,
		"discord_id": discordID,
		"username":   user.Username,
	}
	if user.Avatar != nil && *user.Avatar != "" {
		resp["avatar"] = fmt.Sprintf("https://cdn.discordapp.com/avatars/%s/%s.png?size=64", discordID, *user.Avatar)
	}
	return c.JSON(http.StatusOK, resp)
}

// POST /auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	// Delete session cookie
	session := &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		// In production: Secure: true,
	}
	c.SetCookie(session)

	// Delete oauth_state cookie if it exists
	state := &http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		// In production: Secure: true,
	}
	c.SetCookie(state)

	return c.Redirect(http.StatusFound, "/")
}
