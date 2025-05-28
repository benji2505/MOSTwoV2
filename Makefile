.PHONY: install format lint test build run setup-db clean help

# Variables
VENV = .venv
PYTHON = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip
FRONTEND_DIR = ./src/frontend
BACKEND_DIR = ./backend

help:
	@echo "Available commands:"
	@echo "  make install      Install all dependencies"
	@echo "  make format       Format code with Black and Prettier"
	@echo "  make lint         Lint Python and TypeScript code"
	@echo "  make test         Run tests"
	@echo "  make build        Build for production"
	@echo "  make run          Run development servers"
	@echo "  make clean        Clean up temporary files"

install: install-backend install-frontend

install-backend:
	# Create virtual environment if it doesn't exist
	test -d $(VENV) || python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements-dev.txt
	$(PIP) install -e .

install-frontend:
	cd $(FRONTEND_DIR) && npm install

format:
	# Format Python code
	$(VENV)/bin/black $(BACKEND_DIR)
	# Format TypeScript/JavaScript code
	cd $(FRONTEND_DIR) && npx prettier --write .

lint:
	# Lint Python code
	$(VENV)/bin/flake8 $(BACKEND_DIR)
	$(VENV)/bin/mypy $(BACKEND_DIR)
	# Lint TypeScript code
	cd $(FRONTEND_DIR) && npx eslint . --ext .js,.jsx,.ts,.tsx

test:
	# Run Python tests
	PYTHONPATH=$(BACKEND_DIR) $(VENV)/bin/pytest $(BACKEND_DIR)/tests
	# Run frontend tests
	cd $(FRONTEND_DIR) && npm test

build:
	# Build frontend
	cd $(FRONTEND_DIR) && npm run build
	# Copy frontend build to backend static files
	mkdir -p $(BACKEND_DIR)/app/static
	rm -rf $(BACKEND_DIR)/app/static/*
	cp -r $(FRONTEND_DIR)/dist/* $(BACKEND_DIR)/app/static/

run:
	# Start backend and frontend in development mode
	docker-compose up --build

clean:
	# Remove Python cache files
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type f -name "*.py[co]" -delete
	# Remove frontend build artifacts
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/dist
	# Remove virtual environment
	rm -rf $(VENV)
