from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Shared properties
class EventBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    enabled: bool = True
    trigger: Dict[str, Any]
    actions: List[Dict[str, Any]]
    machine_id: Optional[str] = None

# Properties to receive on event creation
class EventCreate(EventBase):
    pass

# Properties to receive on event update
class EventUpdate(EventBase):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    trigger: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    machine_id: Optional[str] = None

# Properties shared by models stored in DB
class EventInDBBase(EventBase):
    id: str
    
    class Config:
        from_attributes = True

# Properties to return to client
class Event(EventInDBBase):
    pass

# Properties stored in DB
class EventInDB(EventInDBBase):
    pass
