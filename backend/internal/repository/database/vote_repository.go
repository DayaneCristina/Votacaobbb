package database

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"dayanesantos/voting-system/internal/entity"
	"dayanesantos/voting-system/internal/metrics"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type VoteRepository struct {
	Pool  *pgxpool.Pool
	Redis *redis.Client
	ctx   context.Context
}

func NewVoteRepository(pool *pgxpool.Pool, redisClient *redis.Client) *VoteRepository {
	return &VoteRepository{
		Pool:  pool,
		Redis: redisClient,
		ctx:   context.Background(),
	}
}

func (r *VoteRepository) Create(ctx context.Context, vote entity.Vote) error {
	start := time.Now()

	defer func() {
		metrics.RecordQueryDuration("create_vote", time.Since(start))
	}()

	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO votes (option_id, voted_at, request_id)
		VALUES ($1, $2, $3)
	`

	_, err = tx.Exec(ctx, query, vote.OptionID, vote.VotedAt, vote.RequestID)
	if err != nil {
		return fmt.Errorf("failed to create vote: %w", err)
	}

	cacheKey := fmt.Sprintf("votes:%d", vote.OptionID)
	err = r.Redis.Incr(r.ctx, cacheKey).Err()
	if err != nil {
		fmt.Printf("Warning: failed to update Redis cache: %v\n", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *VoteRepository) GetResults(ctx context.Context) ([]entity.VoteResult, error) {
	cacheResults, err := r.getFromCache()
	if err == nil && len(cacheResults) > 0 {
		metrics.CacheHits.Inc()
		return cacheResults, nil
	}

	metrics.CacheMisses.Inc()

	dbResults, err := r.getFromDatabase(ctx)
	if err != nil {
		return nil, err
	}

	if err := r.updateCache(dbResults); err != nil {
		fmt.Printf("Warning: failed to update cache: %v\n", err)
	}

	return dbResults, nil
}

func (r *VoteRepository) getFromCache() ([]entity.VoteResult, error) {
	keys, err := r.Redis.Keys(r.ctx, "votes:*").Result()
	if err != nil {
		return nil, err
	}

	var results []entity.VoteResult
	for _, key := range keys {
		optionIDStr := key[6:]
		optionID, err := strconv.Atoi(optionIDStr)
		if err != nil {
			continue
		}

		countStr, err := r.Redis.Get(r.ctx, key).Result()
		if err != nil {
			continue
		}

		count, err := strconv.Atoi(countStr)
		if err != nil {
			continue
		}

		results = append(results, entity.VoteResult{
			OptionID: optionID,
			Count:    count,
		})
	}

	return results, nil
}

func (r *VoteRepository) getFromDatabase(ctx context.Context) ([]entity.VoteResult, error) {
	query := `
			SELECT option_id, COUNT(*) as count
			FROM votes
			GROUP BY option_id
			ORDER BY count DESC
	`

	rows, err := r.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get vote results: %w", err)
	}
	defer rows.Close()

	var results []entity.VoteResult
	for rows.Next() {
		var result entity.VoteResult
		if err := rows.Scan(&result.OptionID, &result.Count); err != nil {
			return nil, fmt.Errorf("failed to scan vote result: %w", err)
		}
		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during results iteration: %w", err)
	}

	return results, nil
}

func (r *VoteRepository) updateCache(results []entity.VoteResult) error {
	pipe := r.Redis.Pipeline()

	for _, result := range results {
		cacheKey := fmt.Sprintf("votes:%d", result.OptionID)
		pipe.Set(r.ctx, cacheKey, result.Count, 24*time.Hour)
	}

	_, err := pipe.Exec(r.ctx)
	return err
}
