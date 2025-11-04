package database

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"sort"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func InitDatabase(dbPath string) (*sql.DB, error) {
	// Ensure SQLite foreign keys are enabled on all connections via DSN
	dsn := dbPath
	if strings.Contains(dbPath, "?") {
		dsn = dbPath + "&_foreign_keys=on"
	} else {
		dsn = dbPath + "?_foreign_keys=on"
	}

	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Extra safety: set pragma on the current connection as well
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return nil, fmt.Errorf("failed to enable foreign_keys pragma: %w", err)
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

	// Ensure deterministic order by filename (e.g., 001_..., 002_...)
	sort.Slice(migrations, func(i, j int) bool { return migrations[i].Name() < migrations[j].Name() })

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
