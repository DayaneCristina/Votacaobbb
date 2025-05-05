package entity

import (
	"time"
)

type Vote struct {
	OptionID  int       `json:"option_id" validate:"required"`
	VotedAt   time.Time `json:"voted_at"`
	RequestID string    `json:"request_id"`
}

type VoteResult struct {
	OptionID int `json:"option_id"`
	Count    int `json:"count"`
}
