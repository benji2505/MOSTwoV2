from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Machine])
def read_machines(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve machines.
    """
    machines = crud.machine.get_multi(db, skip=skip, limit=limit)
    return machines

@router.post("/", response_model=schemas.Machine)
def create_machine(
    *,
    db: Session = Depends(deps.get_db),
    machine_in: schemas.MachineCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new machine.
    """
    machine = crud.machine.get_by_ip_port(
        db, ip_address=machine_in.ip_address, port=machine_in.port
    )
    if machine:
        raise HTTPException(
            status_code=400,
            detail="A machine with this IP and port already exists in the system.",
        )
    machine = crud.machine.create(db=db, obj_in=machine_in)
    return machine

@router.get("/{machine_id}", response_model=schemas.Machine)
def read_machine(
    machine_id: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific machine by id.
    """
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=404, detail="Machine not found"
        )
    return machine

@router.put("/{machine_id}", response_model=schemas.Machine)
def update_machine(
    *,
    db: Session = Depends(deps.get_db),
    machine_id: str,
    machine_in: schemas.MachineUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a machine.
    """
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=404, detail="Machine not found"
        )
    machine = crud.machine.update(db, db_obj=machine, obj_in=machine_in)
    return machine

@router.delete("/{machine_id}", response_model=schemas.Machine)
def delete_machine(
    *,
    db: Session = Depends(deps.get_db),
    machine_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a machine.
    """
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=404, detail="Machine not found"
        )
    machine = crud.machine.remove(db=db, id=machine_id)
    return machine
