import uuid
from fastapi import APIRouter, BackgroundTasks, Depends
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
from api.project_cache.database import SessionLocal, Base, engine
from api.project_cache.schemas import MoodChatIn, MoodChatOut, MoodLogOut, MoodAnalyticsOut
from api.project_cache.services.mood_service import MoodFlowService
from api.project_cache.models import MoodLog
from api.project_cache.services.graph_service import send_teams_mood_notification
from api.project_cache.models import User

Base.metadata.create_all(bind=engine)
router = APIRouter()
flow = MoodFlowService()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat", response_model=MoodChatOut)
def chat(body: MoodChatIn, db: Session = Depends(get_db)):
    # Generate user_id and session_id if not provided
    user_id = body.user_id or str(uuid.uuid4())
    session_id = body.session_id or str(uuid.uuid4())

    # Call your mood flow handler
    reply, stage, mood, reason, extra = flow.handle(user_id, session_id, body.message)

    # Process username: trim spaces, fallback to "Anonymous"
    raw_username = extra.get("username") if extra else None
    username = raw_username.strip() if raw_username and raw_username.strip() else "Anonymous"

    today = datetime.now().strftime("%Y-%m-%d")

    # Check if a log already exists for this session
    existing_log = db.query(MoodLog).filter(
        MoodLog.user_id == user_id,
        MoodLog.session_id == session_id
    ).first()

    if existing_log:
        # Update stepwise without overwriting existing values unnecessarily
        if mood:
            existing_log.mood = mood
        if reason:
            existing_log.reason = reason
        existing_log.username = username
        existing_log.date = today
        db.add(existing_log)
    else:
        # Create new log
        new_log = MoodLog(
            user_id=user_id,
            session_id=session_id,
            mood=mood if mood else "unknown",
            reason=reason if reason else body.message,
            date=today,
            username=username
        )
        db.add(new_log)

    db.commit()

    return {
        "reply": reply,
        "stage": stage,
        "user_id": user_id,
        "session_id": session_id,
        "username": username
    }


@router.get("/logs", response_model=list[MoodLogOut])
def logs(
    user_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(MoodLog)
    if user_id:
        q = q.filter(MoodLog.user_id == user_id)
    if date_from:
        q = q.filter(MoodLog.date >= date_from)
    if date_to:
        q = q.filter(MoodLog.date <= date_to)
    rows = q.order_by(MoodLog.created_at.desc()).all()
    return rows


@router.get("/analytics", response_model=MoodAnalyticsOut)
def analytics(
    group_by: str = "day",
    user_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(MoodLog)
    if user_id:
        q = q.filter(MoodLog.user_id == user_id)
    if date_from:
        q = q.filter(MoodLog.date >= date_from)
    if date_to:
        q = q.filter(MoodLog.date <= date_to)
    rows = q.all()

    buckets = {}       # {bucket_label: {mood: count}}
    reasons = []
    global_moods = {}  # overall mood counts across all buckets

    for r in rows:
        label = None
        # support hour / day / month / year
        if group_by == "hour":
            label = r.date[:13]   # YYYY-MM-DD HH
        elif group_by == "day":
            label = r.date[:10]   # YYYY-MM-DD
        elif group_by == "month":
            label = r.date[:7]    # YYYY-MM
        elif group_by == "year":
            label = r.date[:4]    # YYYY
        else:
            label = r.date[:10]   # default = day

        if label not in buckets:
            buckets[label] = {}

        if r.mood:
            buckets[label][r.mood] = buckets[label].get(r.mood, 0) + 1
            global_moods[r.mood] = global_moods.get(r.mood, 0) + 1

        if r.reason:
            reasons.append(r.reason)

    return {
        "buckets": buckets,
        "reasons": reasons,
        "top_moods": global_moods
    }

def notify_employee(emp_email: str):
    """Wrapper to safely send notifications with error handling."""
    try:
        send_teams_mood_notification(emp_email)
        print(f"✅ Notification sent to {emp_email}")
    except Exception as e:
        print(f"❌ Failed to notify {emp_email}: {e}")

@router.post("/trigger-mood")
def trigger_mood(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Called by HR panel to send mood metrics notifications to all employees.
    Runs notifications in background so HR panel responds quickly.
    """
    employees = db.query(User).filter(User.is_active == True).all()

    if not employees:
        return {"status": "error", "message": "No active employees found"}

    for emp in employees:
        background_tasks.add_task(notify_employee, emp.email)

    return {
        "status": "success",
        "message": f"Queued notifications for {len(employees)} employees"
    }
