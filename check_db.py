import sqlite3
conn = sqlite3.connect('instance/agency.db')
rows = conn.execute("SELECT id, name, price FROM package").fetchall()
print(f"Packages ({len(rows)} rows):", rows)
stories = conn.execute("SELECT id, couple FROM story").fetchall()
print(f"Stories ({len(stories)} rows):", stories)
films = conn.execute("SELECT id, title FROM film").fetchall()
print(f"Films ({len(films)} rows):", films)
conn.close()
