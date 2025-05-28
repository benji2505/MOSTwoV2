import logging
from typing import Any

from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.session import SessionLocal

# Make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# Otherwise, SQL Alchemy might fail to initialize relationships properly.

def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # Base.metadata.create_all(bind=engine)
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)  # noqa: F841
        logging.info("Created first superuser")
    else:
        logging.warning("Skipping creating superuser. User with email %s already exists.", settings.FIRST_SUPERUSER)


def init() -> None:
    db = SessionLocal()
    init_db(db)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    logging.info("Creating initial data")
    init()
    logging.info("Initial data created")


if __name__ == "__main__":
    main()
