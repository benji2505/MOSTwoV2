# MOSTwo - Hardware Automation Platform

MOSTwo is an automation tool for configuring, monitoring, and controlling hardware components like Raspberry Pi and Arduino through a web interface.

## Features

- Support for multiple hardware platforms (Raspberry Pi, Arduino, extensible via plugins)
- Digital and analog inputs/outputs with logical, timed, and counting operations
- JSON-based machine configurations and event sequences
- Web-based frontend with visual editor and real-time monitoring
- IoT integration via MQTT

## Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Node.js 18+ and npm 9+

## Getting Started

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MOSTwoV2
   ```

2. **Set up the development environment**
   ```bash
   # Copy .env.example to .env and update values if needed
   cp .env.example .env
   
   # Start development services
   docker-compose up -d
   ```

3. **Install dependencies**
   ```bash
   # Backend (Python)
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements-dev.txt
   
   # Frontend (Node.js)
   cd src/frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Start backend
   cd backend
   uvicorn main:app --reload
   
   # In a separate terminal, start frontend
   cd src/frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Using Makefile

```bash
# Install all dependencies
make install

# Format code
make format

# Lint code
make lint

# Run tests
make test

# Build for production
make build

# Clean up
make clean
```

## Project Structure

```
MOSTwoV2/
├── backend/                 # Backend Python code
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/            # Core application logic
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic models
│   │   └── services/        # Business logic
│   └── tests/               # Backend tests
├── src/frontend/            # Frontend React application
│   ├── public/              # Static files
│   └── src/                 # Source code
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Utility functions
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Backend Dockerfile
├── Dockerfile.frontend      # Frontend Dockerfile
├── requirements-dev.txt     # Python development dependencies
└── package.json             # Frontend dependencies
```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with a descriptive message:
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

3. Push your changes to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub and request a code review.

## Testing

### Backend Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app tests/
```

### Frontend Tests
```bash
cd src/frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Production Build
```bash
# Build frontend
cd src/frontend
npm run build

# Copy build to backend static files
cp -r build/* ../backend/app/static/

# Run backend with production settings
cd ../../backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up --build -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
