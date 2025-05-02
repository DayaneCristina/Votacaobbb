package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"bbb/models"
	"bbb/storage"
)

type voteRequest struct {
	ParticipantID string `json:"participantId"`
}

func HandleVote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var vr voteRequest
	if err := json.NewDecoder(r.Body).Decode(&vr); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	storage.RegisterVote(vr.ParticipantID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Voto registrado com sucesso!",
	})
}

func HandleResults(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	results := storage.GetResults()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK - " + time.Now().Format(time.RFC1123)))
}
