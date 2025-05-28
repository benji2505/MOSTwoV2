# MOSTwo Backend

This is the backend service for the MOSTwo Hardware Automation Platform, built with FastAPI and SQLAlchemy.

## Features

- RESTful API for managing machines and automation events
- JWT-based authentication
- SQLite database (can be easily switched to PostgreSQL/MySQL)
- CORS support
- Input validation using Pydantic
- Automated API documentation with Swagger UI and ReDoc

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MOSTwoV2/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

## Database Setup

The application uses SQLite by default. The database will be created automatically when you first run the application.

To initialize the database with the first superuser, run:
```bash
python init_db.py
```

## Running the Application

To start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Testing

To run the tests:
```bash
pytest
```

## Project Structure

```
backend/
├── app/
│   ├── api/                  # API routes
│   ├── core/                 # Core functionality (config, security)
│   ├── crud/                 # Database CRUD operations
│   ├── db/                   # Database configuration
│   ├── models/               # SQLAlchemy models
│   └── schemas/              # Pydantic models/schemas
├── tests/                    # Test files
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── init_db.py                # Database initialization script
├── main.py                   # Application entry point
└── requirements.txt          # Project dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Secret key for JWT token generation | `your-secret-key-here` |
| `ALGORITHM` | Algorithm for JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes | `1440` (24 hours) |
| `SQLALCHEMY_DATABASE_URI` | Database connection URL | `sqlite:///./mostwo.db` |
| `FIRST_SUPERUSER` | Email of the first superuser | `admin@example.com` |
| `FIRST_SUPERUSER_PASSWORD` | Password for the first superuser | `changeme` |
| `BACKEND_CORS_ORIGINS` | List of allowed CORS origins | `["*"]` |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
