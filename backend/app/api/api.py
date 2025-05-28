from fastapi import APIRouter

from app.api.endpoints import events, machines, auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(machines.router, prefix="/machines", tags=["machines"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
