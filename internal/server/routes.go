package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo, dependencies *Dependencies) {
	jwtMiddleware := JWTAuthMiddleware([]byte(dependencies.Config.JWT.Secret))

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Handlers
	authHandler := dependencies.AuthHandler
	profileHandler := dependencies.ProfileHandler

	// Auth routes (public)
	authPublic := e.Group("/auth")
	authPublic.GET("/discord/login", authHandler.DiscordLogin)
	authPublic.GET("/discord/callback", authHandler.DiscordCallback)

	// Auth routes (protected)
	authProtected := e.Group("/auth", jwtMiddleware)
	authProtected.GET("/me", authHandler.Me)
	authProtected.POST("/logout", authHandler.Logout)

	// Profile routes (all protected)
	profileGroup := e.Group("/profile", jwtMiddleware)

	// iRacing Profile - Complete profile operations
	profileGroup.GET("/iracing", profileHandler.GetIRacingProfile)    // Get complete profile (with licenses & languages)
	profileGroup.PUT("/iracing", profileHandler.UpdateIRacingProfile) // Update basic profile info

	// Licenses - Individual license operations
	profileGroup.GET("/iracing/licenses", profileHandler.GetLicenses)   // Get all licenses
	profileGroup.PUT("/iracing/licenses", profileHandler.UpsertLicense) // Create/update a specific license

	// Languages - Language operations
	profileGroup.GET("/iracing/languages", profileHandler.GetLanguages)    // Get user's languages
	profileGroup.PUT("/iracing/languages", profileHandler.UpsertLanguages) // Update user's languages (replaces list)
	e.GET("/languages", profileHandler.GetAllLanguages)                    // Get all available languages catalog
}
