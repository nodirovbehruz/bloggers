import sqlite3
conn = sqlite3.connect('d:/Blogers/backend/database.db')
c = conn.cursor()
c.execute("UPDATE sponsors SET logo_url = '/uploads/sponsors/techcorp.png' WHERE name = 'TechCorp'")
c.execute("UPDATE sponsors SET logo_url = '/uploads/sponsors/mediagroup.png' WHERE name = 'MediaGroup'")
c.execute("UPDATE sponsors SET logo_url = '/uploads/sponsors/digitalwave.png' WHERE name = 'DigitalWave'")
conn.commit()
c.execute('SELECT id, name, logo_url FROM sponsors')
for r in c.fetchall():
    print(r)
conn.close()
