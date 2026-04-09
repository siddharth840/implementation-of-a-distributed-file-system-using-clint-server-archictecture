import sqlite3

def migrate_db():
    try:
        conn = sqlite3.connect('nimbusfs.db')
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE files ADD COLUMN is_deleted BOOLEAN DEFAULT 0")
        conn.commit()
        print("Successfully added 'is_deleted' column.")
        conn.close()
    except Exception as e:
        print(f"Error migrating DB: {e}")

if __name__ == "__main__":
    migrate_db()
