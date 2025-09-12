import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---- Ensure project path ----
sys.path.append(os.path.dirname(__file__))

# ---- Import your merged app ----
from merged_main import app as merged_app

# ---- Create new FastAPI instance (entrypoint for Azure) ----
app = FastAPI(title="HCC Backend", version="1.0.0")

# Add CORS (important for Angular frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Mount merged app routers into this app ----
app.mount("", merged_app)
