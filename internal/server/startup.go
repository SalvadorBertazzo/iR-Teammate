package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Start(deps *Dependencies) error {
	e := NewEchoServer()
	SetupRoutes(e, deps)

	e.Start(":" + deps.Config.Server.Port)

	return nil
}

func NewEchoServer() *echo.Echo {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	return e
}

func SetupRoutes(e *echo.Echo, deps *Dependencies) {
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})
}
