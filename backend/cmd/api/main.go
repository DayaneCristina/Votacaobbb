package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	redis "github.com/redis/go-redis/v9"

	"dayanesantos/voting-system/internal/config"
	"dayanesantos/voting-system/internal/controller"
	"dayanesantos/voting-system/internal/metrics"
	redisRepository "dayanesantos/voting-system/internal/repository/cache"
	database "dayanesantos/voting-system/internal/repository/database"
	"dayanesantos/voting-system/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	pgPool, err := initPostgres(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize PostgreSQL: %v", err)
	}
	defer pgPool.Close()

	redisClient := initRedis(cfg)
	defer redisClient.Close()

	voteRepo := database.NewVoteRepository(pgPool, redisClient)
	cacheRepo := redisRepository.NewCacheRepository(redisClient, cfg.Redis.CacheTTL)

	voteService := service.NewVoteService(voteRepo, cacheRepo)

	voteController := controller.NewVoteController(voteService)
	healthController := controller.NewHealthController(pgPool, redisClient)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())

	e.Use(middleware.CORS())

	metrics.Init(e)
	e.Use(metrics.HTTPMetricsMiddleware)

	api := e.Group("/api/v1")
	api.POST("/votes", voteController.RegisterVote)
	api.GET("/votes/results", voteController.GetVoteResults)

	api.GET("/health", healthController.HealthCheck)
	api.GET("/health/liveness", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "alive"})
	})

	go func() {
		if err := e.Start(fmt.Sprintf(":%s", cfg.App.ServerPort)); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatalf("Shutting down the server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}

func initPostgres(cfg *config.Config) (*pgxpool.Pool, error) {
	connString := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s",
		cfg.DB.User,
		cfg.DB.Pass,
		cfg.DB.Host,
		cfg.DB.Port,
		cfg.DB.Name,
	)

	poolConfig, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("unable to parse DB config: %w", err)
	}

	poolConfig.MaxConns = 10
	poolConfig.MinConns = 2
	poolConfig.HealthCheckPeriod = 1 * time.Minute
	poolConfig.MaxConnLifetime = 2 * time.Hour
	poolConfig.MaxConnIdleTime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	return pool, nil
}

func initRedis(cfg *config.Config) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: "",
		DB:       0,
	})
}
