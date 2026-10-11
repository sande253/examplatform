from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from sqlalchemy import inspect, text
import json

app = FastAPI(title="ExamPlatform API", version="1.0.0")

# Allow all origins temporarily to fix CORS issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def create_local_database() -> None:
    """Create the local development schema when SQLite is selected."""
    if settings.DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
        # `create_all` does not add new columns to an existing SQLite file.
        # Keep the local development database compatible when the JSON payload
        # field is introduced.
        columns = {column["name"] for column in inspect(engine).get_columns("documents")}
        if "extracted_questions" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE documents ADD COLUMN extracted_questions JSON"))

@app.get("/health")
def health_check():
    return {"status": "ok"}
