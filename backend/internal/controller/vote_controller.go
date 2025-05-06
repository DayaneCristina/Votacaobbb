package controller

import (
	"net/http"
	"strconv"
	"time"
	"dayanesantos/voting-system/internal/metrics"
	"dayanesantos/voting-system/internal/service"

	"github.com/go-playground/validator"
	"github.com/labstack/echo/v4"
)

type VoteController struct {
	Service   *service.VoteService
	Validator *validator.Validate
}

func NewVoteController(service *service.VoteService) *VoteController {
	v := validator.New()
	return &VoteController{
		Service:   service,
		Validator: v,
	}
}

type voteRequest struct {
	OptionID int `json:"option_id" validate:"required"`
}

func (c *VoteController) RegisterVote(ctx echo.Context) error {
	var req voteRequest
	optionStr := strconv.Itoa(req.OptionID)
	metrics.VotesCounter.WithLabelValues(optionStr).Inc()

	if err := ctx.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, map[string]interface{}{
            "error":   "invalid_request",
            "message": "Invalid request payload",
            "details": err.Error(),
        })
    }

	if err := c.Validator.Struct(req); err != nil {
		return c.handleValidationError(ctx, err)
	}

	requestID := ctx.Response().Header().Get(echo.HeaderXRequestID)
	vote, err := c.Service.RegisterVote(ctx.Request().Context(), req.OptionID, requestID)
	if err != nil {
		return c.handleError(ctx, http.StatusInternalServerError, "vote_registration_failed", "Failed to register vote", err)
	}

	return ctx.JSON(http.StatusCreated, vote)
}

func (c *VoteController) GetVoteResults(ctx echo.Context) error {
	time.Sleep(5 * time.Second)
	results, err := c.Service.GetResults(ctx.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get vote results")
	}

	return ctx.JSON(http.StatusOK, results)
}

func (c *VoteController) handleValidationError(ctx echo.Context, err error) error {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		errors := make(map[string]string)
		for _, e := range validationErrors {
			errors[e.Field()] = e.Tag()
		}

		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"error":   "validation_failed",
			"message": "Validation failed",
			"details": errors,
		})
	}

	return c.handleError(ctx, http.StatusBadRequest, "validation_error", "Validation error", err)
}

func (c *VoteController) handleError(ctx echo.Context, status int, errorCode, message string, err error) error {
	details := ""
	if err != nil {
		details = err.Error()
	}

	return ctx.JSON(status, map[string]interface{}{
		"error":   errorCode,
		"message": message,
		"details": details,
	})
}
