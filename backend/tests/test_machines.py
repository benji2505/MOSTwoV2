import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid

from app.core.config import settings
from app.models import Machine
from app.schemas.machine import MachineCreate, MachineUpdate


def test_create_machine(client: TestClient, db_session: Session, user_token_headers: dict):
    # Test creating a new machine
    machine_data = {
        "name": "Test Machine",
        "type": "test_type",
        "ip_address": "192.168.1.1",
        "port": 8080,
        "status": "idle"
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/machines/",
        json=machine_data,
        headers=user_token_headers
    )
    
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert data["name"] == machine_data["name"], "Machine name doesn't match"
    assert "id" in data, "Response missing 'id' field"
    
    # Verify machine was created in the database
    db_machine = db_session.query(Machine).filter(Machine.id == data["id"]).first()
    assert db_machine is not None, "Machine not found in database"
    assert db_machine.name == machine_data["name"]
    assert db_machine.id == data["id"], "Machine ID mismatch"


def test_read_machine(client: TestClient, db_session: Session, user_token_headers: dict):
    # Create a test machine
    machine_in = MachineCreate(
        name="Test Read Machine",
        type="test_type",
        ip_address="192.168.1.1",
        port=8080,
        status="idle"
    )
    db_machine = Machine(**machine_in.model_dump())
    db_session.add(db_machine)
    db_session.commit()
    db_session.refresh(db_machine)
    
    # Test reading the machine
    response = client.get(
        f"{settings.API_V1_STR}/machines/{db_machine.id}",
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert data["id"] == db_machine.id, "Machine ID mismatch"
    assert data["name"] == db_machine.name, "Machine name mismatch"


def test_read_machine_not_found(client: TestClient, user_token_headers: dict):
    # Test reading a non-existent machine with a valid UUID format
    non_existent_id = str(uuid.uuid4())
    response = client.get(
        f"{settings.API_V1_STR}/machines/{non_existent_id}",
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND, "Expected 404 for non-existent machine"


def test_read_machines(client: TestClient, db_session: Session, user_token_headers: dict):
    # Clear existing machines to avoid test interference
    db_session.query(Machine).delete()
    db_session.commit()
    
    # Create some test machines
    machines = [
        {
            "name": f"Machine {i}",
            "type": f"type_{i}",
            "ip_address": f"192.168.1.{i+1}",
            "port": 8080 + i,
            "status": "idle"
        }
        for i in range(5)
    ]
    for machine in machines:
        db_machine = Machine(**machine)
        db_session.add(db_machine)
    db_session.commit()
    
    # Test reading all machines with pagination
    response = client.get(
        f"{settings.API_V1_STR}/machines/",
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert isinstance(data, list), "Expected a list of machines"
    assert len(data) == 5, f"Expected 5 machines, got {len(data)}"


def test_update_machine(client: TestClient, db_session: Session, user_token_headers: dict):
    # Create a test machine
    machine_in = MachineCreate(
        name="Test Update Machine",
        type="type1",
        ip_address="192.168.1.1",
        port=8080,
        status="idle"
    )
    db_machine = Machine(**machine_in.model_dump())
    db_session.add(db_machine)
    db_session.commit()
    db_session.refresh(db_machine)
    
    # Test updating the machine
    update_data = {
        "name": "Updated Machine Name",
        "type": "updated_type",
        "ip_address": "192.168.1.100",
        "port": 9000,
        "status": "running"
    }
    response = client.put(
        f"{settings.API_V1_STR}/machines/{db_machine.id}",
        json=update_data,
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert data["name"] == update_data["name"], "Name not updated"
    assert data["status"] == update_data["status"], "Status not updated"
    
    # Verify the update in the database
    db_session.refresh(db_machine)
    assert db_machine.name == update_data["name"]
    assert db_machine.status == update_data["status"]
    assert db_machine.port == update_data["port"]


def test_delete_machine(client: TestClient, db_session: Session, user_token_headers: dict):
    # Create a test machine
    machine_in = MachineCreate(
        name="Test Delete Machine",
        type="type1",
        ip_address="192.168.1.1",
        port=8080,
        status="idle"
    )
    db_machine = Machine(**machine_in.model_dump())
    db_session.add(db_machine)
    db_session.commit()
    db_session.refresh(db_machine)
    machine_id = db_machine.id
    
    # Test deleting the machine
    response = client.delete(
        f"{settings.API_V1_STR}/machines/{machine_id}",
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert data["id"] == machine_id, "Deleted machine ID doesn't match"
    
    # Verify the machine was deleted
    deleted_machine = db_session.query(Machine).filter(Machine.id == machine_id).first()
    assert deleted_machine is None, "Machine was not deleted from database"
    
    # Verify the machine is really gone
    response = client.get(
        f"{settings.API_V1_STR}/machines/{machine_id}",
        headers=user_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND, "Machine should return 404 after deletion"
