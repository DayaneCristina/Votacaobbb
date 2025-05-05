FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache docker-cli git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o voting-system ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o migrate ./cmd/migrate

FROM builder AS tester
RUN apk add --no-cache build-base

RUN go test -v ./test/integration/... -tags=integration -coverprofile=coverage.out

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/voting-system .
COPY --from=builder /app/migrate .

COPY --from=builder /app/migrations ./migrations/

EXPOSE 8080

CMD ["./voting-system"]
