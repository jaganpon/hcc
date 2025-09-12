from fastapi import APIRouter
from project1.virtual_onboarding_backend_fixed.app.database import get_conn

router = APIRouter(prefix='/admin', tags=['admin'])

@router.get('/joinees')
def list_joinees():
    conn = get_conn(); cur = conn.cursor()
    cur.execute('SELECT id,name,email,phone,start_date,temp_id,created_at FROM users ORDER BY created_at DESC')
    users = [dict(r) for r in cur.fetchall()]
    result = []

    for u in users:
        uid = u['id']

        # total and completed counts
        cur.execute('SELECT COUNT(*) FROM user_task_progress WHERE user_id = ?', (uid,))
        total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM user_task_progress WHERE user_id = ? AND status = 'completed'", (uid,))
        completed = cur.fetchone()[0]

        remaining = total - completed

        # completed task details
        cur.execute('''
            SELECT ut.task_id as id, COALESCE(t.name, 'Unknown') as name
            FROM user_task_progress ut
            LEFT JOIN tasks t ON ut.task_id = t.id
            WHERE ut.user_id = ? AND ut.status = "completed"
        ''', (uid,))
        completed_tasks = [dict(r) for r in cur.fetchall()]


        # pending task details
        cur.execute(
            'SELECT t.id, t.name FROM tasks t '
            'JOIN user_task_progress ut ON ut.task_id = t.id '
            'WHERE ut.user_id = ? AND ut.status != "completed"',
            (uid,)
        )
        pending_tasks = [dict(r) for r in cur.fetchall()]

        result.append({
            'id': uid,
            'name': u['name'],
            'email': u['email'],
            'phone': u['phone'],
            'temp_id': u['temp_id'],
            'progress': {
                'total_tasks': total,
                'completed_tasks': completed,
                'remaining_tasks': remaining,
                'completion_percent': round((completed/total*100) if total else 0, 2),
                'completed_task_details': completed_tasks,
                'pending_task_details': pending_tasks
            }
        })

    conn.close()
    return result


@router.get('/analytics/summary')
def analytics_summary():
    conn = get_conn(); cur = conn.cursor()

    cur.execute('SELECT COUNT(*) FROM users')
    total_users = cur.fetchone()[0]

    cur.execute('''
        SELECT t.id, t.name, 
               COUNT(ut.id) as total_attempts, 
               SUM(CASE WHEN ut.status = "completed" THEN 1 ELSE 0 END) as completed 
        FROM tasks t 
        LEFT JOIN user_task_progress ut ON ut.task_id = t.id 
        GROUP BY t.id 
        ORDER BY t.id
    ''')
    task_stats = [dict(r) for r in cur.fetchall()]

    conn.close()
    return {'total_users': total_users, 'task_stats': task_stats}
