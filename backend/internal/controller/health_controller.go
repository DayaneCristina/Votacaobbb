package controller

import (
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
)

type HealthController struct {
	db          *pgxpool.Pool
	redisClient *redis.Client
}

func NewHealthController(db *pgxpool.Pool, redisClient *redis.Client) *HealthController {
	return &HealthController{
		db:          db,
		redisClient: redisClient,
	}
}

type healthCheckResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Details   map[string]string `json:"details,omitempty"`
}

func (c *HealthController) HealthCheck(ctx echo.Context) error {
	response := healthCheckResponse{
		Status:    "healthy",
		Timestamp: time.Now().UTC(),
		Details:   make(map[string]string),
	}

	response.Details["database"] = "healthy"
	response.Details["redis"] = "healthy"

	checkCtx, cancel := context.WithTimeout(ctx.Request().Context(), 2*time.Second)
	defer cancel()

	dbErr := c.db.Ping(checkCtx)
	if dbErr != nil {
		response.Status = "degraded"
		response.Details["database"] = "unhealthy"
	}

	_, redisErr := c.redisClient.Ping(checkCtx).Result()
	if redisErr != nil {
		response.Status = "degraded"
		response.Details["redis"] = "unhealthy"
	}

	statusCode := http.StatusOK
	if response.Status != "healthy" {
		statusCode = http.StatusServiceUnavailable
	}

	return ctx.JSON(statusCode, response)
}
