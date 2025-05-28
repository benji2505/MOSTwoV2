import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app import crud, schemas

# Test data
TEST_MACHINE = {
    "name": "Test Machine",
    "type": "raspberry_pi",
    "ip_address": "192.168.1.100",
    "port": 8000,
    "status": "offline"
}

TEST_EVENT = {
    "name": "Test Event",
    "description": "A test event",
    "enabled": True,
    "trigger": {
        "type": "schedule",
        "schedule": "* * * * *"
    },
    "actions": [
        {
            "type": "http_request",
            "target_machine_id": "machine_id_placeholder",
            "endpoint": "/api/test",
            "method": "GET"
        }
    ]
}

# Test machine endpoints
def test_create_machine(client, test_machine_data):
    response = client.post("/api/machines/", json=test_machine_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == test_machine_data["name"]
    assert data["type"] == test_machine_data["type"]
    assert data["ip_address"] == test_machine_data["ip_address"]
    assert data["port"] == test_machine_data["port"]
    assert data["status"] == test_machine_data["status"]
    assert "id" in data


def test_read_machine(client, test_machine_data, db_session: Session):
    # Create a machine first
    machine = crud.create_machine(db_session, schemas.MachineCreate(**test_machine_data))
    
    response = client.get(f"/api/machines/{machine.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == str(machine.id)
    assert data["name"] == test_machine_data["name"]


def test_read_machines(client, test_machine_data, db_session: Session):
    # Create a machine first
    crud.create_machine(db_session, schemas.MachineCreate(**test_machine_data))
    
    response = client.get("/api/machines/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert any(machine["name"] == test_machine_data["name"] for machine in data)


def test_update_machine(client, test_machine_data, db_session: Session):
    # Create a machine first
    machine = crud.create_machine(db_session, schemas.MachineCreate(**test_machine_data))
    
    update_data = {"name": "Updated Machine Name"}
    response = client.put(f"/api/machines/{machine.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["id"] == str(machine.id)


def test_delete_machine(client, test_machine_data, db_session: Session):
    # Create a machine first
    machine = crud.create_machine(db_session, schemas.MachineCreate(**test_machine_data))
    
    response = client.delete(f"/api/machines/{machine.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    response = client.get(f"/api/machines/{machine.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

# Test event endpoints
def test_create_event(client, db_session: Session):
    # First create a machine since events depend on machines
    machine = crud.create_machine(db_session, schemas.MachineCreate(**TEST_MACHINE))
    
    # Update the event data with the actual machine ID
    event_data = TEST_EVENT.copy()
    event_data["actions"][0]["target_machine_id"] = str(machine.id)
    
    response = client.post("/api/events/", json=event_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == event_data["name"]
    assert data["enabled"] == event_data["enabled"]
    assert "id" in data
    assert len(data["actions"]) == 1
    assert data["actions"][0]["target_machine_id"] == str(machine.id)


def test_read_event(client, db_session: Session):
    # Create a machine and event first
    machine = crud.create_machine(db_session, schemas.MachineCreate(**TEST_MACHINE))
    event_data = TEST_EVENT.copy()
    event_data["actions"][0]["target_machine_id"] = str(machine.id)
    event = crud.create_event(db_session, schemas.EventCreate(**event_data))
    
    response = client.get(f"/api/events/{event.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == str(event.id)
    assert data["name"] == event_data["name"]

# Test health check endpoint
def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "healthy"}
