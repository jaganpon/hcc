from fastapi import APIRouter
from api.project1.virtual_onboarding_backend_fixed.app.database import get_conn

router = APIRouter()

@router.get('/modules')
def modules():
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT id,name,description,order_index FROM modules ORDER BY order_index")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get('/tasks')
def tasks(module_id: int | None = None):
    conn = get_conn(); cur = conn.cursor()
    if module_id:
        cur.execute("SELECT id,module_id,name,description,type,order_index FROM tasks WHERE module_id = ? ORDER BY order_index", (module_id,))
    else:
        cur.execute("SELECT id,module_id,name,description,type,order_index FROM tasks ORDER BY module_id, order_index")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get('/agenda/day1')
def agenda_day1():
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT id,day,time,title,link FROM agenda_items WHERE day='DAY1' ORDER BY time")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get('/trainings')
def trainings():
    conn = get_conn(); cur = conn.cursor()
    cur.execute('SELECT id,code,title,url,mandatory,est_minutes FROM trainings ORDER BY mandatory DESC, title')
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get('/faq')
def faq(tag: str | None = None):
    conn = get_conn(); cur = conn.cursor()
    if tag:
        cur.execute('SELECT id,question,answer,tag FROM policy_faq WHERE tag = ?', (tag,))
    else:
        cur.execute('SELECT id,question,answer,tag FROM policy_faq')
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows
