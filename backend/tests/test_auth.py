import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud import crud_user
from app.schemas.user import UserCreate


def test_get_access_token(client, db_session: Session):
    # Create a test user
    email = "test@example.com"
    password = "testpass123"
    user_in = UserCreate(email=email, password=password, full_name="Test User")
    crud.user.create(db_session, obj_in=user_in)
    
    # Test login with correct credentials
    login_data = {
        "username": email,
        "password": password,
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", data=login_data
    )
    tokens = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"


def test_use_access_token(client, db_session: Session):
    # Create a test user
    email = "test2@example.com"
    password = "testpass123"
    user_in = UserCreate(email=email, password=password, full_name="Test User 2")
    user = crud.user.create(db_session, obj_in=user_in)
    
    # Get access token
    login_data = {
        "username": email,
        "password": password,
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", data=login_data
    )
    tokens = response.json()
    access_token = tokens["access_token"]
    
    # Test accessing protected route with token
    response = client.get(
        f"{settings.API_V1_STR}/auth/login/test-token",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == email


def test_register_user(client, db_session: Session):
    email = "newuser@example.com"
    password = "newpass123"
    user_data = {
        "email": email,
        "password": password,
        "full_name": "New User",
    }
    
    # Test user registration
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=user_data,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == email
    assert "id" in data
    
    # Verify user was created in the database
    user = crud.user.get_by_email(db_session, email=email)
    assert user is not None
    assert user.email == email


def test_register_existing_user(client, db_session: Session):
    # First create a user
    email = "existing@example.com"
    password = "testpass123"
    user_in = UserCreate(email=email, password=password, full_name="Existing User")
    crud.user.create(db_session, obj_in=user_in)
    
    # Try to create the same user again
    user_data = {
        "email": email,
        "password": password,
        "full_name": "Existing User",
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=user_data,
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_incorrect_login(client, db_session: Session):
    # Try to login with non-existent user
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword",
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", data=login_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Incorrect email or password" in response.json()["detail"]
    
    # Try to login with wrong password
    email = "test3@example.com"
    password = "correctpass"
    user_in = UserCreate(email=email, password=password, full_name="Test User 3")
    crud.user.create(db_session, obj_in=user_in)
    
    login_data = {
        "username": email,
        "password": "wrongpassword",
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", data=login_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Incorrect email or password" in response.json()["detail"]
