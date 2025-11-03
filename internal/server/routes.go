package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo, dependencies *Dependencies) {
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	authHandler := dependencies.AuthHandler
	e.GET("/auth/discord/login", authHandler.DiscordLogin)
	e.GET("/auth/discord/callback", authHandler.DiscordCallback)

	// Protected route: requires a valid JWT
	jwtMiddleware := JWTAuthMiddleware([]byte(dependencies.Config.JWT.Secret))
	e.GET("/me", authHandler.Me, jwtMiddleware)
	e.POST("/auth/logout", authHandler.Logout, jwtMiddleware)
}
