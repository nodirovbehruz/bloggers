import sqlite3
import json
import os

def export_for_postgres():
    db_path = "blogger_awards.db"
    sql_out = "backup.sql"
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall() if t[0] not in ('sqlite_sequence',)]

    with open(sql_out, "w", encoding="utf-8") as f:
        f.write("-- Automated Export for PostgreSQL --\n\n")
        f.write("BEGIN;\n\n")
        
        # Clean existing tables (optional, but good for sync)
        for table in reversed(tables):
            f.write(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;\n")
        
        f.write("\n")

        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = [c[1] for c in cursor.fetchall()]
            
            cursor.execute(f"SELECT * FROM {table};")
            rows = cursor.fetchall()
            
            for row in rows:
                vals = []
                for val in row:
                    if val is None:
                        vals.append("NULL")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    elif isinstance(val, str):
                        # Escape single quotes for SQL
                        escaped = val.replace("'", "''")
                        vals.append(f"'{escaped}'")
                    else:
                        # Fallback for JSON or other types
                        vals.append(f"'{str(val)}'")
                
                col_list = ", ".join(columns)
                val_list = ", ".join(vals)
                f.write(f"INSERT INTO {table} ({col_list}) VALUES ({val_list});\n")
            
            f.write("\n")

        f.write("COMMIT;\n")
    
    conn.close()
    print(f"SUCCESS: Exported {len(tables)} tables to {sql_out}")

if __name__ == "__main__":
    export_for_postgres()
