package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"dayanesantos/voting-system/internal/entity"

	"github.com/redis/go-redis/v9"
)

type CacheRepository struct {
	Client *redis.Client
	TTL    time.Duration
}

func NewCacheRepository(client *redis.Client, ttl time.Duration) *CacheRepository {
	return &CacheRepository{
		Client: client,
		TTL:    ttl,
	}
}

func (r *CacheRepository) SetResults(ctx context.Context, results []entity.VoteResult) error {
	resultsJSON, err := json.Marshal(results)
	if err != nil {
		return fmt.Errorf("failed to marshal results: %w", err)
	}

	if err := r.Client.Set(ctx, "vote_results", resultsJSON, r.TTL).Err(); err != nil {
		return fmt.Errorf("failed to set results in cache: %w", err)
	}

	return nil
}

func (r *CacheRepository) GetResults(ctx context.Context) ([]entity.VoteResult, error) {
	resultsJSON, err := r.Client.Get(ctx, "vote_results").Bytes()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to get results from cache: %w", err)
	}

	var results []entity.VoteResult
	if err := json.Unmarshal(resultsJSON, &results); err != nil {
		return nil, fmt.Errorf("failed to unmarshal results: %w", err)
	}

	return results, nil
}
