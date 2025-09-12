import json
from fastapi import APIRouter, HTTPException
from fastapi.params import Body
from pydantic import BaseModel
from api.project1.virtual_onboarding_backend_fixed.app.database import get_conn
import uuid, datetime

router = APIRouter()

def generate_temp_id():
    return 'ONB-' + uuid.uuid4().hex[:8].upper()

# ---- NEW model for JSON body ----
class UserCreate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    start_date: str | None = None

@router.post('/new')
def create_user(payload: UserCreate = Body(...)):
    """
    Create a new user (accepts JSON body).
    Example:
    {
      "name": "John",
      "email": "john@example.com",
      "phone": "1234567890",
      "start_date": "2025-09-03"
    }
    """
    conn = get_conn(); cur = conn.cursor()
    temp_id = generate_temp_id()
    now = datetime.datetime.utcnow().isoformat()

    cur.execute(
        'INSERT INTO users (name,email,phone,start_date,temp_id,created_at) VALUES (?,?,?,?,?,?)',
        (payload.name, payload.email, payload.phone, payload.start_date, temp_id, now)
    )
    conn.commit()
    user_id = cur.lastrowid

    # initialize all tasks as "not_started"
    cur.execute('SELECT id FROM tasks')
    tasks = [r[0] for r in cur.fetchall()]
    for t in tasks:
        cur.execute(
            'INSERT INTO user_task_progress (user_id, task_id, status, updated_at) VALUES (?,?,?,?)',
            (user_id, t, 'not_started', now)
        )

    conn.commit()
    conn.close()
    return {
        'user_id': user_id,
        'temp_id': temp_id,
        'name': payload.name,
        'email': payload.email,
        'phone': payload.phone,
        'start_date': payload.start_date
    }

@router.post('/continue')
def continue_user(temp_id: str):
    conn = get_conn(); cur = conn.cursor()
    cur.execute('SELECT id,name,email,phone,start_date,temp_id,created_at FROM users WHERE temp_id = ?', (temp_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail='Temp ID not found')
    return dict(row)


@router.get('/{temp_id}/progress')
def get_progress(temp_id: str):
    conn = get_conn(); cur = conn.cursor()
    cur.execute('SELECT id FROM users WHERE temp_id = ?', (temp_id,))
    r = cur.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail='Temp ID not found')
    user_id = r[0]

    # modules with tasks
    cur.execute('SELECT id,name,description,order_index FROM modules ORDER BY order_index')
    modules = [dict(m) for m in cur.fetchall()]

    for m in modules:
        cur.execute('SELECT t.id,t.name,t.description,t.type,ut.status,ut.data '
                    'FROM tasks t JOIN user_task_progress ut ON ut.task_id = t.id AND ut.user_id = ? '
                    'WHERE t.module_id = ? ORDER BY t.order_index', (user_id, m['id']))
        tasks = []
        for row in cur.fetchall():
            task = dict(row)
            if task['data']:
                task['data'] = json.loads(task['data'])
            tasks.append(task)
        m['tasks'] = tasks

    # overall progress
    cur.execute('SELECT COUNT(*) FROM user_task_progress WHERE user_id = ?', (user_id,))
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM user_task_progress WHERE user_id = ? AND status = 'completed'", (user_id,))
    completed = cur.fetchone()[0]

    conn.close()
    return {
        'user_id': user_id,
        'temp_id': temp_id,
        'overall_percent': int((completed/total)*100) if total else 0,
        'modules': modules
    }

@router.post('/{temp_id}/tasks/{task_id}/complete')
def complete_task(temp_id: str, task_id: int, form_data: dict = Body({})):
    """
    Marks a single task as completed. Can accept optional form_data for that task.
    """
    conn = get_conn(); cur = conn.cursor()
    cur.execute('SELECT id FROM users WHERE temp_id = ?', (temp_id,))
    r = cur.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail='Temp ID not found')
    user_id = r[0]
    now = datetime.datetime.utcnow().isoformat()

    cur.execute('SELECT id FROM user_task_progress WHERE user_id = ? AND task_id = ?', (user_id, task_id))
    pr = cur.fetchone()
    if not pr:
        # Insert if missing
        cur.execute('INSERT INTO user_task_progress (user_id, task_id, status, data, updated_at) VALUES (?,?,?,?,?)',
                    (user_id, task_id, 'completed', json.dumps(form_data), now))
    else:
        cur.execute('UPDATE user_task_progress SET status = ?, data = ?, updated_at = ? WHERE id = ?',
                    ('completed', json.dumps(form_data), now, pr[0]))

    conn.commit()
    conn.close()
    return {'message': 'Task marked completed', 'task_id': task_id}

@router.post("/complete")
def complete_onboarding(temp_id: str):
    """
    Marks all tasks as completed for the user (optional endpoint, mostly finalizing onboarding)
    """
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE temp_id = ?", (temp_id,))
    r = cur.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Temp ID not found")
    user_id = r[0]

    # mark all tasks completed if needed
    cur.execute("UPDATE user_task_progress SET status='completed', updated_at=? WHERE user_id=?", (datetime.datetime.utcnow().isoformat(), user_id))
    conn.commit()
    conn.close()
    return {"message": "Onboarding completed successfully"}
