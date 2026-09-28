from db import init_db, conn

init_db()
c = conn()
for row in c.execute("SELECT id, customer_id, status, address FROM orders"):
    print(dict(row))