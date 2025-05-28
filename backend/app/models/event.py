from sqlalchemy import Column, String, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=True)
    trigger = Column(JSON, nullable=False)
    actions = Column(JSON, nullable=False)
    
    # Relationships
    machine_id = Column(String(36), ForeignKey("machines.id", ondelete="CASCADE"), nullable=True)
    machine = relationship("Machine", back_populates="events")

    def __repr__(self):
        return f"<Event {self.name} ({'enabled' if self.enabled else 'disabled'})>"
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "enabled": self.enabled,
            "trigger": self.trigger,
            "actions": self.actions,
            "machine_id": self.machine_id
        }
