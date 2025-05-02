package storage

import (
	"sync"
	"time"

	"bbb/models"
)

var (
	mutex       sync.Mutex
	votes       = make(map[string]int)
	votesByHour = make(map[string]int)
	totalVotes  = 0
)

func RegisterVote(participantID string) {
	mutex.Lock()
	defer mutex.Unlock()

	votes[participantID]++
	totalVotes++

	hour := time.Now().Format("2006-01-02 15:00")
	votesByHour[hour]++
}

func GetResults() models.Results {
	mutex.Lock()
	defer mutex.Unlock()

	return models.Results{
		Total:         totalVotes,
		ByParticipant: copyMap(votes),
		ByHour:        copyMap(votesByHour),
	}
}

func copyMap(original map[string]int) map[string]int {
	copy := make(map[string]int)
	for k, v := range original {
		copy[k] = v
	}
	return copy
}
