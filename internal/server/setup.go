package server

import (
	"database/sql"
	"iR-Teammate/internal/config"
	"iR-Teammate/internal/database"
	"log"

	"github.com/jmoiron/sqlx"
)

type Dependencies struct {
	Config config.Config
	DB     *sql.DB
	SQLxDB *sqlx.DB
}

func Setup(config config.Config) (*Dependencies, error) {
	db, err := database.InitDatabase(config.Database.Path)
	if err != nil {
		return nil, err
	}
	log.Println("Database initialized successfully")

	sqlxDB := sqlx.NewDb(db, "sqlite3")

	return &Dependencies{
		Config: config,
		DB:     db,
		SQLxDB: sqlxDB,
	}, nil
}

func (d *Dependencies) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
