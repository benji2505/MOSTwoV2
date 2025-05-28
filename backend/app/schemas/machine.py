from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Shared properties
class MachineBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: str = Field(..., max_length=50)
    ip_address: str
    port: int = Field(..., gt=0, lt=65536)
    status: Optional[str] = "offline"

# Properties to receive on machine creation
class MachineCreate(MachineBase):
    pass

# Properties to receive on machine update
class MachineUpdate(MachineBase):
    name: Optional[str] = None
    type: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    status: Optional[str] = None

# Properties shared by models stored in DB
class MachineInDBBase(MachineBase):
    id: str
    
    class Config:
        from_attributes = True

# Properties to return to client
class Machine(MachineInDBBase):
    pass

# Properties stored in DB
class MachineInDB(MachineInDBBase):
    pass
