# Virtual Onboarding Backend (Fixed)

Run locally:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DB_PATH=./app/dev.db  # optional, default points to app/dev.db
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- GET /health
- Public: /public/modules, /public/tasks, /public/agenda/day1, /public/trainings, /public/faq
- Users: POST /users/new, POST /users/continue, GET /users/{temp_id}/progress, POST /users/{temp_id}/tasks/{task_id}/complete
- Admin: GET /admin/joinees, GET /admin/analytics/summary
