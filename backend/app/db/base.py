from typing import Generator, Any, Union
import uuid
from sqlalchemy import create_engine, event, String
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Add support for UUID in SQLite
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    if settings.SQLALCHEMY_DATABASE_URI.startswith('sqlite'):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create SQLAlchemy engine with JSON serializer for UUID
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args={"check_same_thread": False},  # SQLite specific
    json_serializer=lambda obj: str(obj) if isinstance(obj, uuid.UUID) else None
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False
)

# Base class for SQLAlchemy models
@as_declarative()
class Base:
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

def get_db() -> Generator[Session, None, None]:
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
