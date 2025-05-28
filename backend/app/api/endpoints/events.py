from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Event])
def read_events(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve events.
    """
    events = crud.event.get_multi(db, skip=skip, limit=limit)
    return events

@router.post("/", response_model=schemas.Event)
def create_event(
    *,
    db: Session = Depends(deps.get_db),
    event_in: schemas.EventCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new event.
    """
    event = crud.event.get_by_name(db, name=event_in.name)
    if event:
        raise HTTPException(
            status_code=400,
            detail="An event with this name already exists in the system.",
        )
    event = crud.event.create(db=db, obj_in=event_in)
    return event

@router.get("/{event_id}", response_model=schemas.Event)
def read_event(
    event_id: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific event by id.
    """
    event = crud.event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=404, detail="Event not found"
        )
    return event

@router.put("/{event_id}", response_model=schemas.Event)
def update_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: str,
    event_in: schemas.EventUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an event.
    """
    event = crud.event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=404, detail="Event not found"
        )
    event = crud.event.update(db, db_obj=event, obj_in=event_in)
    return event

@router.delete("/{event_id}", response_model=schemas.Event)
def delete_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an event.
    """
    event = crud.event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=404, detail="Event not found"
        )
    event = crud.event.remove(db=db, id=event_id)
    return event

@router.post("/{event_id}/toggle", response_model=schemas.Event)
def toggle_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: str,
    enabled: bool,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Toggle an event's enabled status.
    """
    event = crud.event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=404, detail="Event not found"
        )
    event = crud.event.toggle_event(db, db_obj=event, enabled=enabled)
    return event
