import sqlite3
import os

def export_for_postgres():
    db_path = "blogger_awards.db"
    sql_out = "backup.sql"
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall() if t[0] not in ('sqlite_sequence',)]

    with open(sql_out, "w", encoding="utf-8") as f:
        f.write("-- Automated Pro Export for PostgreSQL --\n")
        f.write("SET session_replication_role = 'replica';\n")
        f.write("BEGIN;\n\n")
        
        for table in reversed(tables):
            f.write(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;\n")
        
        f.write("\n")

        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            col_infos = cursor.fetchall()
            columns = [c[1] for c in col_infos]
            
            bool_indexes = []
            for i, cinfo in enumerate(col_infos):
                ctype = str(cinfo[2]).upper()
                cname = str(cinfo[1]).lower()
                if "BOOLEAN" in ctype or cname.startswith("is_") or cname == "active":
                    bool_indexes.append(i)
            
            cursor.execute(f"SELECT * FROM {table};")
            rows = cursor.fetchall()
            
            for row in rows:
                vals = []
                for i, val in enumerate(row):
                    if val is None:
                        vals.append("NULL")
                    elif i in bool_indexes:
                        if val == 1 or val is True or str(val).lower() in ('1', 'true'):
                            vals.append("TRUE")
                        else:
                            vals.append("FALSE")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    elif isinstance(val, str):
                        escaped = val.replace("'", "''")
                        vals.append(f"'{escaped}'")
                    else:
                        vals.append(f"'{str(val)}'")
                
                col_list = ", ".join(columns)
                val_list = ", ".join(vals)
                f.write(f"INSERT INTO {table} ({col_list}) VALUES ({val_list});\n")
            
            print(f"Exported {table} ({len(rows)} rows, booleans: {len(bool_indexes)})")
            f.write("\n")

        f.write("COMMIT;\n")
        f.write("SET session_replication_role = 'origin';\n")
        
        f.write("\n-- Update sequences --\n")
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            cols = [c[1] for c in cursor.fetchall()]
            if 'id' in cols:
                f.write(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), coalesce(max(id), 1)) FROM {table};\n")

    conn.close()
    print(f"SUCCESS: Exported with BOOLEAN FIX to {sql_out}")

if __name__ == "__main__":
    export_for_postgres()
