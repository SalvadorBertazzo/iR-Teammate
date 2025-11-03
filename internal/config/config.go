package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Discord  DiscordConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
	Host string
	Env  string
}

type DatabaseConfig struct {
	Path string
}

type DiscordConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

func LoadConfig() (Config, error) {
	_ = godotenv.Load()

	expiry, err := time.ParseDuration(getOptionalEnv("JWT_EXPIRY", "1h"))
	if err != nil {
		return Config{}, err
	}

	config := &Config{
		Server: ServerConfig{
			Port: getOptionalEnv("SERVER_PORT", "8080"),
			Host: getOptionalEnv("SERVER_HOST", "localhost"),
			Env:  getOptionalEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Path: getOptionalEnv("DATABASE_PATH", "data.db"),
		},
		Discord: DiscordConfig{
			ClientID:     getRequiredEnv("DISCORD_CLIENT_ID"),
			ClientSecret: getRequiredEnv("DISCORD_CLIENT_SECRET"),
			RedirectURL:  getRequiredEnv("DISCORD_REDIRECT_URL"),
		},
		JWT: JWTConfig{
			Secret: getRequiredEnv("JWT_SECRET"),
			Expiry: expiry,
		},
	}

	return *config, nil
}

func getOptionalEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Environment variable %s is required", key)
	}
	return value
}
