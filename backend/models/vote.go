package models

type Results struct {
	Total        int            `json:"total"`
	ByParticipant map[string]int `json:"byParticipant"`
	ByHour       map[string]int `json:"byHour"`
}
