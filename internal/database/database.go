package database

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func InitDatabase(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

func runMigrations(db *sql.DB) error {
	migrations, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	log.Println("Starting database migrations...")

	for _, migration := range migrations {
		if migration.IsDir() {
			continue
		}

		fileName := migration.Name()
		if !strings.HasSuffix(fileName, ".sql") {
			continue
		}

		log.Printf("Running migration: %s", fileName)

		content, readErr := migrationsFS.ReadFile("migrations/" + fileName)
		if readErr != nil {
			return fmt.Errorf("failed to read migration %s: %w", fileName, readErr)
		}

		if _, err := db.Exec(string(content)); err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", fileName, err)
		}

		log.Printf("Migration %s completed successfully", fileName)
	}

	log.Println("All migrations completed successfully")
	return nil
}
