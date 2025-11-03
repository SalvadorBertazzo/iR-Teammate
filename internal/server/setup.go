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
	Config         config.Config
	DB             *sql.DB
	SQLxDB         *sqlx.DB
	AuthHandler    *handler.AuthHandler
	ProfileHandler *handler.ProfileHandler
}

func Setup(config config.Config) (*Dependencies, error) {
	db, err := database.InitDatabase(config.Database.Path)
	if err != nil {
		return nil, err
	}
	log.Println("Database initialized successfully")

	sqlxDB := sqlx.NewDb(db, "sqlite3")

	// Discord OAuth configuration
	oauthCfg := auth.NewDiscordAuth(config.Discord)

	// Repositories
	userRepository := repository.NewUserRepository(sqlxDB)
	userIRacingRepository := repository.NewUserIRacingRepository(sqlxDB)
	userIRacingLicenseRepository := repository.NewUserIRacingLicenseRepository(sqlxDB)
	userLanguageRepository := repository.NewUserLanguageRepository(sqlxDB)

	// Services
	authService := service.NewAuthService(userRepository, userIRacingRepository, oauthCfg, config.JWT)
	profileService := service.NewProfileService(userIRacingRepository, userIRacingLicenseRepository, userLanguageRepository)

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	profileHandler := handler.NewProfileHandler(profileService)

	return &Dependencies{
		Config:         config,
		DB:             db,
		SQLxDB:         sqlxDB,
		AuthHandler:    authHandler,
		ProfileHandler: profileHandler,
	}, nil
}

func (d *Dependencies) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
