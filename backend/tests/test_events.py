import pytest
from datetime import datetime, timedelta
from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Event, Machine
from app.schemas.event import EventCreate


def test_create_event(client, db_session: Session):
    # Create a test machine first
    machine = Machine(
        name="Test Machine for Event",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    db_session.refresh(machine)
    
    # Test creating a new event
    event_data = {
        "title": "Test Event",
        "description": "A test event",
        "start_time": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        "end_time": (datetime.utcnow() + timedelta(hours=2)).isoformat(),
        "machine_id": machine.id,
        "status": "scheduled"
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/events/",
        json=event_data,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == event_data["title"]
    assert "id" in data
    
    # Verify event was created in the database
    db_event = db_session.query(Event).filter(Event.id == data["id"]).first()
    assert db_event is not None
    assert db_event.title == event_data["title"]
    assert db_event.machine_id == machine.id


def test_read_event(client, db_session: Session):
    # Create a test machine and event
    machine = Machine(
        name="Test Machine for Event Read",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    
    event_in = EventCreate(
        title="Test Read Event",
        description="Test Description",
        start_time=datetime.utcnow() + timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=2),
        machine_id=machine.id,
        status="scheduled"
    )
    db_event = Event(**event_in.dict())
    db_session.add(db_event)
    db_session.commit()
    db_session.refresh(db_event)
    
    # Test reading the event
    response = client.get(f"{settings.API_V1_STR}/events/{db_event.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == db_event.id
    assert data["title"] == db_event.title
    assert data["machine_id"] == machine.id


def test_read_event_not_found(client):
    # Test reading a non-existent event
    response = client.get(f"{settings.API_V1_STR}/events/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_read_events(client, db_session: Session):
    # Create a test machine
    machine = Machine(
        name="Test Machine for Events List",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    
    # Create some test events
    for i in range(5):
        event = Event(
            title=f"Event {i}",
            description=f"Description {i}",
            start_time=datetime.utcnow() + timedelta(hours=i),
            end_time=datetime.utcnow() + timedelta(hours=i+1),
            machine_id=machine.id,
            status="scheduled"
        )
        db_session.add(event)
    db_session.commit()
    
    # Test reading all events with pagination
    response = client.get(f"{settings.API_V1_STR}/events/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == 5
    assert data["total"] == 5


def test_update_event(client, db_session: Session):
    # Create a test machine and event
    machine = Machine(
        name="Test Machine for Event Update",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    
    event_in = EventCreate(
        title="Test Update Event",
        description="Old Description",
        start_time=datetime.utcnow() + timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=2),
        machine_id=machine.id,
        status="scheduled"
    )
    db_event = Event(**event_in.dict())
    db_session.add(db_event)
    db_session.commit()
    db_session.refresh(db_event)
    
    # Test updating the event
    update_data = {
        "title": "Updated Event Title",
        "description": "Updated Description",
        "status": "in_progress"
    }
    response = client.put(
        f"{settings.API_V1_STR}/events/{db_event.id}",
        json=update_data,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["status"] == update_data["status"]
    
    # Verify the update in the database
    db_session.refresh(db_event)
    assert db_event.title == update_data["title"]
    assert db_event.description == update_data["description"]
    assert db_event.status == update_data["status"]


def test_toggle_event_status(client, db_session: Session):
    # Create a test machine and event
    machine = Machine(
        name="Test Machine for Event Toggle",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    
    event_in = EventCreate(
        title="Test Toggle Event",
        description="Test Toggle",
        start_time=datetime.utcnow() + timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=2),
        machine_id=machine.id,
        status="scheduled"
    )
    db_event = Event(**event_in.dict())
    db_session.add(db_event)
    db_session.commit()
    db_session.refresh(db_event)
    
    # Test toggling the event status
    response = client.put(
        f"{settings.API_V1_STR}/events/{db_event.id}/toggle"
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "completed"  # Should toggle from scheduled to completed
    
    # Toggle again
    response = client.put(
        f"{settings.API_V1_STR}/events/{db_event.id}/toggle"
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "scheduled"  # Should toggle back to scheduled


def test_delete_event(client, db_session: Session):
    # Create a test machine and event
    machine = Machine(
        name="Test Machine for Event Delete",
        description="Test Machine",
        location="Test Location",
        status="idle"
    )
    db_session.add(machine)
    db_session.commit()
    
    event_in = EventCreate(
        title="Test Delete Event",
        description="To be deleted",
        start_time=datetime.utcnow() + timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=2),
        machine_id=machine.id,
        status="scheduled"
    )
    db_event = Event(**event_in.dict())
    db_session.add(db_event)
    db_session.commit()
    db_session.refresh(db_event)
    
    # Test deleting the event
    response = client.delete(f"{settings.API_V1_STR}/events/{db_event.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == db_event.id
    
    # Verify the event was deleted
    db_event = db_session.query(Event).filter(Event.id == db_event.id).first()
    assert db_event is None
