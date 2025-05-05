package config

import (
	"os"
	"strconv"
	"time"
)

type AppConfig struct {
	ServerPort string
}

type DBConfig struct {
	Host string
	Port int
	User string
	Pass string
	Name string
}

type RedisConfig struct {
	Host     string
	Port     int
	CacheTTL time.Duration
}

type Config struct {
	App   AppConfig
	DB    DBConfig
	Redis RedisConfig
}

func LoadConfig() *Config {
	dbPort, _ := strconv.Atoi(os.Getenv("DB_PORT"))
	redisPort, _ := strconv.Atoi(os.Getenv("REDIS_PORT"))
	cacheTTL, _ := time.ParseDuration(os.Getenv("CACHE_TTL"))

	return &Config{
		App: AppConfig{
			ServerPort: getEnv("SERVER_PORT", "8000"),
		},
		DB: DBConfig{
			Host: getEnv("DB_HOST", "localhost"),
			Port: dbPort,
			User: getEnv("DB_USER", "postgres"),
			Pass: getEnv("DB_PASS", "postgres"),
			Name: getEnv("DB_NAME", "database"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "redis"),
			Port:     redisPort,
			CacheTTL: cacheTTL,
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
