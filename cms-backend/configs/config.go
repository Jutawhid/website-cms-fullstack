package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
}

func LoadConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		// Default local database url for testing (using dedicated port 5433 to avoid host conflicts)
		dbUrl = "host=localhost user=postgres password=secret dbname=cms port=5433 sslmode=disable timezone=UTC"
	}

	return Config{
		Port:        port,
		DatabaseURL: dbUrl,
	}
}
