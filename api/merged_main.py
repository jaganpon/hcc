from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# ---- Load .env early ----
BASE_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE_DIR, "project_cache", ".env"))

# ---- Project 1 imports ----
from project1.virtual_onboarding_backend_fixed.app.routers import public, users, admin

# ---- Project 2 imports ----
from project_cache import database
from project_cache.routes import onboarding, mood


# ---- Init DB (from project_cache) ----
database.Base.metadata.create_all(bind=database.engine)

# ---- Create unified app ----
app = FastAPI(
    title="Merged Backend (Onboarding + Chatbot)",
    version="1.0.0"
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Project 1 routes ----
app.include_router(public.router, prefix="/v1", tags=["public"])
app.include_router(users.router, prefix="/v1", tags=["users"])
app.include_router(admin.router, prefix="/v1", tags=["admin"])

# ---- Project 2 routes ----
app.include_router(onboarding.router, prefix="/v1/onboarding", tags=["Onboarding RAG"])
app.include_router(mood.router, prefix="/v1/mood", tags=["Mood Tracker"])

# ---- Health ----
@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "Merged backend running",
        "env_loaded": bool(os.getenv("AZURE_OPENAI_API_KEY"))
    }
