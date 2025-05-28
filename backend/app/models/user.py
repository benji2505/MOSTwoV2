from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    _is_active = Column('is_active', Boolean(), default=True)
    _is_superuser = Column('is_superuser', Boolean(), default=False)
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def is_active(self) -> bool:
        return self._is_active
    
    @is_active.setter
    def is_active(self, value: bool) -> None:
        self._is_active = value
    
    @property
    def is_superuser(self) -> bool:
        return self._is_superuser
    
    @is_superuser.setter
    def is_superuser(self, value: bool) -> None:
        self._is_superuser = value
        
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser
        }
