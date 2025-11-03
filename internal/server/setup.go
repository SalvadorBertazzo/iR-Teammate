package server

import (
	"database/sql"
	"iR-Teammate/internal/auth"
	"iR-Teammate/internal/config"
	"iR-Teammate/internal/database"
	"iR-Teammate/internal/handler"
	"iR-Teammate/internal/repository"
	"iR-Teammate/internal/service"
	"log"

	"github.com/jmoiron/sqlx"
)

type Dependencies struct {
	Config      config.Config
	DB          *sql.DB
	SQLxDB      *sqlx.DB
	AuthHandler *handler.AuthHandler
}

func Setup(config config.Config) (*Dependencies, error) {
	db, err := database.InitDatabase(config.Database.Path)
	if err != nil {
		return nil, err
	}
	log.Println("Database initialized successfully")

	sqlxDB := sqlx.NewDb(db, "sqlite3")

	oauthCfg := auth.NewDiscordAuth(config.Discord)
	userRepository := repository.NewUserRepository(sqlxDB)
	authService := service.NewAuthService(userRepository, oauthCfg, config.JWT)
	authHandler := handler.NewAuthHandler(authService)

	return &Dependencies{
		Config:      config,
		DB:          db,
		SQLxDB:      sqlxDB,
		AuthHandler: authHandler,
	}, nil
}

func (d *Dependencies) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
