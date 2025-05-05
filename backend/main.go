package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
)

// Estrutura para receber os dados do request
type VotoRequest struct {
	ParticipantId string `json:"participantId"`
	CaptchaToken  string `json:"captchaToken"`
}

// Estrutura para a resposta do Google reCAPTCHA
type CaptchaResponse struct {
	Success     bool     `json:"success"`
	Score       float64  `json:"score"`
	Action      string   `json:"action"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes"`
}

// Estrutura para o status da votação
type VotingStatus struct {
	Participant1 int `json:"participant1"`
	Participant2 int `json:"participant2"`
	TotalVotes   int `json:"totalVotes"`
}

// Estrutura para a resposta da API
type ApiResponse struct {
	Success      bool          `json:"success"`
	Message      string        `json:"message"`
	VotingStatus *VotingStatus `json:"votingStatus,omitempty"`
	Errors       []string      `json:"errors,omitempty"`
}

// Chave secreta do reCAPTCHA (mantenha isso seguro, nunca no frontend)
const RECAPTCHA_SECRET_KEY = "6LfV3S0rAAAAAG9s3N3QzMpCSMgzbgy5afKMMjWL"

func main() {
	// Definir a porta do servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // Porta padrão se não estiver definida no ambiente
	}

	// Configurar rotas
	http.HandleFunc("/api/votar", votarHandler)

	// Iniciar o servidor
	fmt.Printf("Servidor rodando na porta %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func votarHandler(w http.ResponseWriter, r *http.Request) {
	// Configurar headers CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handling preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Verificar se é um método POST
	if r.Method != "POST" {
		sendJSONResponse(w, http.StatusMethodNotAllowed, ApiResponse{
			Success: false,
			Message: "Método não permitido",
		})
		return
	}

	// Ler e decodificar o corpo da requisição
	var votoReq VotoRequest
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		sendJSONResponse(w, http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Erro ao ler dados da requisição",
		})
		return
	}
	defer r.Body.Close()

	err = json.Unmarshal(body, &votoReq)
	if err != nil {
		sendJSONResponse(w, http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Erro ao processar JSON da requisição",
		})
		return
	}

	// Verificar se os parâmetros obrigatórios foram fornecidos
	if votoReq.ParticipantId == "" || votoReq.CaptchaToken == "" {
		sendJSONResponse(w, http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "ID do participante e token CAPTCHA são obrigatórios",
		})
		return
	}

	// Verificar o token do CAPTCHA com a API do Google
	captchaValid, errorCodes := verificarCaptcha(votoReq.CaptchaToken)
	if !captchaValid {
		sendJSONResponse(w, http.StatusBadRequest, ApiResponse{
			Success: false,
			Message: "Verificação de CAPTCHA falhou",
			Errors:  errorCodes,
		})
		return
	}

	// Se o CAPTCHA for válido, processar o voto
	// Aqui você adicionaria sua lógica para salvar o voto no banco de dados
	// ...

	// Retornar status atual da votação (simulado)
	votingStatus := VotingStatus{
		Participant1: 123, // Número real do banco de dados
		Participant2: 456, // Número real do banco de dados
		TotalVotes:   579, // participant1 + participant2
	}

	sendJSONResponse(w, http.StatusOK, ApiResponse{
		Success:      true,
		Message:      "Voto computado com sucesso",
		VotingStatus: &votingStatus,
	})
}

func verificarCaptcha(token string) (bool, []string) {
	// Preparar os dados para enviar ao Google
	data := url.Values{}
	data.Set("secret", RECAPTCHA_SECRET_KEY)
	data.Set("response", token)

	// Fazer requisição para a API do Google
	resp, err := http.Post(
		"https://www.google.com/recaptcha/api/siteverify",
		"application/x-www-form-urlencoded",
		strings.NewReader(data.Encode()),
	)

	if err != nil {
		return false, []string{"Erro ao verificar CAPTCHA"}
	}
	defer resp.Body.Close()

	// Ler resposta
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, []string{"Erro ao ler resposta do CAPTCHA"}
	}

	// Decodificar resposta
	var captchaResp CaptchaResponse
	err = json.Unmarshal(body, &captchaResp)
	if err != nil {
		return false, []string{"Erro ao decodificar resposta do CAPTCHA"}
	}

	return captchaResp.Success, captchaResp.ErrorCodes
}

func sendJSONResponse(w http.ResponseWriter, statusCode int, response ApiResponse) {
	// Configurar cabeçalho de resposta
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	// Serializar e enviar resposta
	json.NewEncoder(w).Encode(response)
}
