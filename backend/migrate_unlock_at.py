import sqlite3

try:
    conn = sqlite3.connect('nimbusfs.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE files ADD COLUMN unlock_at DATETIME;")
    conn.commit()
    conn.close()
    print("Migration successful: added unlock_at to files table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Migration skipped: column already exists.")
    else:
        print(f"Migration failed: {e}")
except Exception as e:
    print(f"Error: {e}")
