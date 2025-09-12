import os, sqlite3
DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'app.db'))

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
