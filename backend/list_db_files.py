import sqlite3

def list_files():
    try:
        conn = sqlite3.connect('nimbusfs.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, is_deleted FROM files")
        rows = cursor.fetchall()
        print("Files in DB:")
        for row in rows:
            print(row)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_files()
