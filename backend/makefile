DOCKER_COMPOSE = docker-compose
APP_NAME = voting-app
DB_SERVICE = postgres
MIGRATE_CMD = ./migrate

.PHONY: up down migrate clean logs

up:
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down

migrate:
	$(DOCKER_COMPOSE) exec $(APP_NAME) $(MIGRATE_CMD) up

clean:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker system prune -f
logs:
	$(DOCKER_COMPOSE) logs -f

shell:
	$(DOCKER_COMPOSE) exec $(APP_NAME) sh

status:
	$(DOCKER_COMPOSE) ps

all: up migrate