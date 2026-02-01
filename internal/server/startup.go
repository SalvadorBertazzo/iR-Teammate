package server

import (
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Start(deps *Dependencies) error {
	e := NewEchoServer()
	RegisterRoutes(e, deps)

	// Serve frontend static files
	e.Static("/", "frontend")

	e.Start(":" + deps.Config.Server.Port)

	return nil
}

func NewEchoServer() *echo.Echo {
	e := echo.New()
	// e.Use(middleware.Logger())
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} | ${status} | ${method} ${uri} | ${latency_human} | ${remote_ip}\n",
		Output: os.Stdout,
	}))
	e.Use(middleware.Recover())
	// e.Use(middleware.CORS())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5500", "http://127.0.0.1:5500"},
		AllowMethods:     []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
		AllowCredentials: true,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	return e
}
