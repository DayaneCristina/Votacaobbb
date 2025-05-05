package service

import (
	"context"
	"fmt"
	"time"

	"dayanesantos/voting-system/internal/entity"
	redis "dayanesantos/voting-system/internal/repository/cache"
	postgres "dayanesantos/voting-system/internal/repository/database"
)

type VoteService struct {
	VoteRepo  *postgres.VoteRepository
	CacheRepo *redis.CacheRepository
}

func NewVoteService(voteRepo *postgres.VoteRepository, cacheRepo *redis.CacheRepository) *VoteService {
	return &VoteService{
		VoteRepo:  voteRepo,
		CacheRepo: cacheRepo,
	}
}

func (s *VoteService) RegisterVote(ctx context.Context, optionID int, requestID string) (*entity.Vote, error) {
	vote := entity.Vote{
		OptionID:  optionID,
		VotedAt:   time.Now().UTC(),
		RequestID: requestID,
	}

	if err := s.VoteRepo.Create(ctx, vote); err != nil {
		return nil, fmt.Errorf("failed to register vote: %w", err)
	}

	return &vote, nil
}

func (s *VoteService) GetResults(ctx context.Context) ([]entity.VoteResult, error) {
	return s.VoteRepo.GetResults(ctx)
}
