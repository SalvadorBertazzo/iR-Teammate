package server

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Start(deps *Dependencies) error {
	e := NewEchoServer()
	RegisterRoutes(e, deps)

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
