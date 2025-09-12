import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import onboarding, mood
from api.project_cache.database import Base, engine
from dotenv import load_dotenv
from fastapi import APIRouter

load_dotenv()  # read .env
router = APIRouter()

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Unified Chatbot Backend (Pydantic v2)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router, prefix="/onboarding", tags=["Onboarding RAG"])
app.include_router(mood.router, prefix="/mood", tags=["Mood Tracker"])

@router.get("/")
def root():
    return {"message": "Backend running. Use /onboarding/* and /mood/* endpoints"}
