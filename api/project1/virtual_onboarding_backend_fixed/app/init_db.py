import sqlite3

def init_db():
    conn = sqlite3.connect("app.db")
    cur = conn.cursor()

    # Drop old tables (if any) to start fresh
    cur.execute("DROP TABLE IF EXISTS user_task_progress")
    cur.execute("DROP TABLE IF EXISTS tasks")
    cur.execute("DROP TABLE IF EXISTS modules")
    cur.execute("DROP TABLE IF EXISTS users")

    # Create tables
    cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        start_date TEXT,
        temp_id TEXT UNIQUE,
        created_at TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        order_index INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER,
        name TEXT,
        description TEXT,
        type TEXT,
        order_index INTEGER,
        FOREIGN KEY (module_id) REFERENCES modules(id)
    )
    """)

    cur.execute("""
    CREATE TABLE user_task_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task_id INTEGER,
        status TEXT,
        updated_at TEXT,
        data TEXT,   -- JSON or text for storing partial form data
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
    """)

    # Seed Modules
    modules = [
        ("Pre-Onboarding", "Documents, bank details, IT setup", 1),
        ("Day 1 Orientation", "HR induction, IT orientation, buddy meet", 2),
        ("Team & Role", "Provide manager, team, and role details", 3),
        ("Compliance Training", "Mandatory company trainings", 4),
    ]
    cur.executemany("INSERT INTO modules (name, description, order_index) VALUES (?, ?, ?)", modules)

    # Seed Tasks
    tasks = [
        (1, "Bank Details", "Fill bank info and upload ID proof", "form", 1),
        (2, "HR Induction", "Complete HR orientation", "checkbox", 1),
        (2, "IT Orientation", "Complete IT onboarding", "checkbox", 2),
        (2, "Buddy Meet", "Meet your assigned buddy", "checkbox", 3),
        (3, "Manager Details", "Provide your manager info", "form", 1),
        (3, "Team Details", "Provide your team info", "form", 2),
        (3, "Role Details", "Provide your role info", "form", 3),
        (4, "Security & Compliance", "Complete security training", "checkbox", 1),
        (4, "Code of Conduct", "Complete conduct training", "checkbox", 2),
        (4, "Diversity & Inclusion", "Complete diversity training", "checkbox", 3),
    ]
    cur.executemany("INSERT INTO tasks (module_id, name, description, type, order_index) VALUES (?, ?, ?, ?, ?)", tasks)

    conn.commit()
    conn.close()
    print("✅ Database initialized with modules and tasks.")


if __name__ == "__main__":
    init_db()
