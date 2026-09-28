from db import conn, init_db

c = conn()
c.executescript("""
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS tickets;
""")
c.commit()
c.close()
init_db()
print("Database reset")