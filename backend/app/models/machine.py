from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey, Text, event
from sqlalchemy.orm import relationship, object_session
import uuid

from app.db.base import Base

class Machine(Base):
    __tablename__ = "machines"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    ip_address = Column(String(50), nullable=False)
    port = Column(Integer, nullable=False)
    status = Column(String(20), default="offline")
    
    # Relationships
    events = relationship("Event", back_populates="machine", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Machine {self.name} ({self.ip_address}:{self.port})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "ip_address": self.ip_address,
            "port": self.port,
            "status": self.status
        }
