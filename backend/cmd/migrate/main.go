package main

import (
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"dayanesantos/voting-system/internal/config"
	"fmt"
	"log"
)

func main() {
	migrationPath, err := filepath.Abs("/app/migrations")
	if err != nil {
		log.Fatalf("Failed to get absolute path: %v", err)
	}

	sourceURL := "file://" + migrationPath

	cfg := config.LoadConfig()

	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.DB.User, cfg.DB.Pass, cfg.DB.Host, cfg.DB.Port, cfg.DB.Name)

	m, err := migrate.New(
		sourceURL,
		dbURL,
	)

	if err != nil {
		log.Fatalf("Failed to initialize migrations: %v", err)
	}

	cmd := os.Args[1]
	switch cmd {
	case "up":
		if err := m.Up(); err != nil {
			version, dirty, err := m.Version()
			if err != nil {
				log.Fatalf("Failed to get dirty version: %v", err)
			}

			log.Printf("Found dirty version %d (dirty: %v), attempting to force clean", version, dirty)

			if err := m.Force(int(version)); err != nil {
				log.Fatalf("Failed to force version: %v", err)
			}

			if dirty {
				log.Println("Reapplying migrations after clean...")
				if err := m.Up(); err != nil {
						log.Fatalf("Failed to apply migrations after clean: %v", err)
				}
			} else {
					log.Println("Database marked as clean, no migrations to apply")
			}
			
			log.Fatalf("Failed to apply migrations: %v", err)
		}

		log.Println("Migrations applied successfully")
	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to rollback migrations: %v", err)
		}
		log.Println("Migrations rolled back successfully")
	default:
		log.Fatalf("Unknown command: %s (available: up, down, force)", cmd)
	}
}
