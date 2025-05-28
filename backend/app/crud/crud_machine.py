from typing import Optional

from sqlalchemy.orm import Session

from app import models, schemas
from app.crud.base import CRUDBase

class CRUDMachine(CRUDBase[models.Machine, schemas.MachineCreate, schemas.MachineUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[models.Machine]:
        return db.query(models.Machine).filter(models.Machine.name == name).first()
    
    def get_by_ip_port(
        self, db: Session, *, ip_address: str, port: int
    ) -> Optional[models.Machine]:
        return db.query(models.Machine).filter(
            models.Machine.ip_address == ip_address,
            models.Machine.port == port
        ).first()
    
    def update_status(
        self, db: Session, *, db_obj: models.Machine, status: str
    ) -> models.Machine:
        db_obj.status = status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

machine = CRUDMachine(models.Machine)
