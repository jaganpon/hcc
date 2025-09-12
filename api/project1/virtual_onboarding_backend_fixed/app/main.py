from fastapi import FastAPI

app = FastAPI(title='Virtual Onboarding Backend (Fixed)')

# DO NOT include routers here anymore — handled in merged_main.py
# from app.routers import public, users, admin
# app.include_router(public.router)
# app.include_router(users.router)
# app.include_router(admin.router)

@app.get("/health")
def health():
    return {"status": "ok"}
