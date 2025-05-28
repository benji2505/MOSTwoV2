from typing import List, Optional

from sqlalchemy.orm import Session

from app import models, schemas
from app.crud.base import CRUDBase

class CRUDEvent(CRUDBase[models.Event, schemas.EventCreate, schemas.EventUpdate]):
    def get_multi_by_machine(
        self, db: Session, *, machine_id: str, skip: int = 0, limit: int = 100
    ) -> List[models.Event]:
        return (
            db.query(self.model)
            .filter(models.Event.machine_id == machine_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_name(self, db: Session, *, name: str) -> Optional[models.Event]:
        return db.query(models.Event).filter(models.Event.name == name).first()
    
    def get_enabled_events(self, db: Session) -> List[models.Event]:
        return db.query(self.model).filter(models.Event.enabled == True).all()
    
    def toggle_event(
        self, db: Session, *, db_obj: models.Event, enabled: bool
    ) -> models.Event:
        db_obj.enabled = enabled
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

event = CRUDEvent(models.Event)
