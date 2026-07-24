# Age of Legends — developer convenience targets
# Requires: Node.js >= 22, pnpm >= 9, Docker (for infra targets).

.DEFAULT_GOAL := help
.PHONY: help install dev build test lint typecheck format check infra-up infra-down clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install workspace dependencies
	pnpm install

dev: ## Run all packages in watch mode
	pnpm run dev

build: ## Build all packages
	pnpm run build

test: ## Run the full test suite
	pnpm run test

lint: ## Lint all packages
	pnpm run lint

typecheck: ## Type-check all packages
	pnpm run typecheck

format: ## Format the codebase
	pnpm run format

check: ## Run format, lint, typecheck and tests
	pnpm run check

infra-up: ## Start local PostgreSQL and Redis
	docker compose up -d

infra-down: ## Stop local infrastructure
	docker compose down

clean: ## Remove build artifacts and caches
	pnpm run clean
