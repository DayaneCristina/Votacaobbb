package main

import (
	"log"
	"net/http"

	"bbb/handlers"
)

func main() {
	http.HandleFunc("/api/vote", handlers.HandleVote)
	http.HandleFunc("/api/results", handlers.HandleResults)
	http.HandleFunc("/api/health", handlers.HandleHealth)

	log.Println("Servidor rodando em http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
