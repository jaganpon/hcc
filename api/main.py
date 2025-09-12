import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------- Load environment ----------------
BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / "project_cache" / ".env")

# ---------------- Add API folder to sys.path ----------------
import sys
sys.path.append(str(BASE_DIR))  # ensures relative imports work

# ---------------- Import routers ----------------
from project1.virtual_onboarding_backend_fixed.app.routers import public, users, admin
from project_cache import database
from project_cache.routes import onboarding, mood

# ---------------- Initialize DB ----------------
database.Base.metadata.create_all(bind=database.engine)

# ---------------- Create FastAPI app ----------------
app = FastAPI(
    title="HCC Backend (Merged Onboarding + Chatbot)",
    version="1.0.0"
)

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Include routers ----------------
app.include_router(public.router, prefix="/api/v1", tags=["public"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])
app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["Onboarding RAG"])
app.include_router(mood.router, prefix="/api/v1/mood", tags=["Mood Tracker"])

# ---------------- Health check ----------------
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "message": "Merged backend running",
        "env_loaded": bool(os.getenv("OPENAI_PROVIDER"))
    }
