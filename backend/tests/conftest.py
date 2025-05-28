import os
import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Dict, Generator

from app.db.base import Base
from app.api.deps import get_db
from app.main import app
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings
from app import crud, models, schemas

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Remove existing test db if it exists
if os.path.exists("test.db"):
    os.remove("test.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    json_serializer=lambda obj: str(obj) if isinstance(obj, uuid.UUID) else None
)

# Create session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def test_user(db_session):
    # Create a test user
    email = "test@example.com"
    password = "testpassword"
    user_in = schemas.UserCreate(
        email=email,
        password=password,
        full_name="Test User"
    )
    user = crud.user.create(db_session, obj_in=user_in)
    # Ensure user is committed to the database
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def user_token_headers(test_user: models.User) -> Dict[str, str]:
    # Generate a token for the test user
    access_token = create_access_token(
        subject=str(test_user.id),  # Ensure ID is string for JWT
        expires_delta=None
    )
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture(scope="function")
def client(test_user, db_session):
    # Override the get_db dependency
    def _get_db_override():
        try:
            yield db_session
        finally:
            pass
            
    # Store original overrides
    original_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = _get_db_override
    
    with TestClient(app=app) as c:
        yield c
    
    # Clean up and restore original overrides
    app.dependency_overrides = original_overrides

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Enable foreign keys for SQLite using text()
    session.execute(text("PRAGMA foreign_keys=ON"))
    session.commit()

    yield session

    # Clean up
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_machine_data():
    return {
        "name": "Test Machine",
        "type": "raspberry_pi",
        "ip_address": "192.168.1.100",
        "port": 8000,
        "status": "offline"
    }
