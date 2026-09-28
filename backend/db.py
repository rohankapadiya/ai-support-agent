import sqlite3, os

DB_PATH = os.getenv("DB_PATH", "shop.db")

def conn():
    c = sqlite3.connect(DB_PATH, check_same_thread=False)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    c = conn()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS customers(
        id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT);
    CREATE TABLE IF NOT EXISTS products(
        sku TEXT PRIMARY KEY, name TEXT, stock INTEGER, price REAL);
    CREATE TABLE IF NOT EXISTS orders(
        id INTEGER PRIMARY KEY, customer_id INTEGER, sku TEXT, qty INTEGER,
        status TEXT, address TEXT, tracking TEXT, eta TEXT);
    CREATE TABLE IF NOT EXISTS tickets(
        id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER,
        subject TEXT, description TEXT, status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    """)
    if c.execute("SELECT COUNT(*) FROM customers").fetchone()[0] == 0:
        c.executemany("INSERT INTO customers VALUES (?,?,?,?)", [
            (1, "Aarav Shah", "aarav@example.com", "9876500001"),
            (2, "Priya Patel", "priya@example.com", "9876500002"),
            (3, "Rohan Mehta", "rohan@example.com", "9876500003"),
            (4, "Ananya Desai", "ananya@example.com", "9876500004"),
            (5, "Vikram Joshi", "vikram@example.com", "9876500005"),
            (6, "Neha Trivedi", "neha@example.com", "9876500006"),
            (7, "Karan Modi", "karan@example.com", "9876500007"),
            (8, "Isha Kapadia", "isha@example.com", "9876500008"),
            (9, "Dev Parikh", "dev@example.com", "9876500009"),
            (10, "Meera Nair", "meera@example.com", "9876500010"),
            (11, "Arjun Reddy", "arjun@example.com", "9876500011"),
            (12, "Sara Khan", "sara@example.com", "9876500012"),
        ])
        c.executemany("INSERT INTO products VALUES (?,?,?,?)", [
            ("SHOE-01", "Running Shoes", 12, 2499.0),
            ("TSHIRT-01", "Cotton T-Shirt", 0, 599.0),
            ("BAG-01", "Laptop Backpack", 5, 1799.0),
            ("WATCH-01", "Smart Watch", 8, 3999.0),
            ("HEAD-01", "Wireless Headphones", 3, 2999.0),
            ("BOTTLE-01", "Steel Water Bottle", 40, 499.0),
            ("JACKET-01", "Denim Jacket", 0, 2199.0),
            ("MOUSE-01", "Gaming Mouse", 15, 1299.0),
        ])
        c.executemany("INSERT INTO orders VALUES (?,?,?,?,?,?,?,?)", [
            (1001, 1, "SHOE-01", 1, "processing", "12 MG Road, Surat", None, "2026-10-05"),
            (1002, 1, "BAG-01", 1, "shipped", "12 MG Road, Surat", "TRK889201", "2026-10-01"),
            (1003, 2, "TSHIRT-01", 2, "delivered", "45 Ring Road, Surat", "TRK551100", "2026-09-20"),
            (1004, 2, "HEAD-01", 1, "processing", "45 Ring Road, Surat", None, "2026-10-06"),
            (1005, 3, "WATCH-01", 1, "shipped", "8 Alkapuri, Vadodara", "TRK772301", "2026-09-30"),
            (1006, 3, "BOTTLE-01", 2, "delivered", "8 Alkapuri, Vadodara", "TRK772302", "2026-09-15"),
            (1007, 4, "JACKET-01", 1, "processing", "22 CG Road, Ahmedabad", None, "2026-10-08"),
            (1008, 4, "SHOE-01", 1, "cancelled", "22 CG Road, Ahmedabad", None, "2026-09-25"),
            (1009, 5, "MOUSE-01", 1, "delivered", "7 Race Course Rd, Rajkot", "TRK663410", "2026-09-18"),
            (1010, 5, "HEAD-01", 1, "shipped", "7 Race Course Rd, Rajkot", "TRK663411", "2026-10-02"),
            (1011, 6, "BAG-01", 1, "processing", "15 Adajan, Surat", None, "2026-10-07"),
            (1012, 6, "TSHIRT-01", 3, "processing", "15 Adajan, Surat", None, "2026-10-09"),
            (1013, 7, "WATCH-01", 1, "delivered", "31 Vesu, Surat", "TRK990021", "2026-09-12"),
            (1014, 8, "BOTTLE-01", 1, "shipped", "5 Satellite, Ahmedabad", "TRK441209", "2026-09-29"),
            (1015, 8, "MOUSE-01", 2, "processing", "5 Satellite, Ahmedabad", None, "2026-10-06"),
            (1016, 9, "JACKET-01", 1, "delivered", "40 Fatehgunj, Vadodara", "TRK220987", "2026-09-10"),
            (1017, 9, "SHOE-01", 2, "cancelled", "40 Fatehgunj, Vadodara", None, "2026-09-22"),
            (1018, 10, "HEAD-01", 1, "processing", "19 Pal Road, Surat", None, "2026-10-04"),
            (1019, 11, "BAG-01", 1, "shipped", "27 Bopal, Ahmedabad", "TRK118833", "2026-10-01"),
            (1020, 11, "WATCH-01", 1, "processing", "27 Bopal, Ahmedabad", None, "2026-10-10"),
            (1021, 12, "SHOE-01", 1, "delivered", "3 Kalawad Rd, Rajkot", "TRK305512", "2026-09-08"),
            (1022, 12, "BOTTLE-01", 3, "processing", "3 Kalawad Rd, Rajkot", None, "2026-10-05"),
            (1023, 10, "MOUSE-01", 1, "delivered", "19 Pal Road, Surat", "TRK776655", "2026-09-14"),
        ])
        c.executemany(
            "INSERT INTO tickets(customer_id, subject, description, status, created_at) VALUES (?,?,?,?,?)", [
            (2, "Late delivery inquiry", "T-shirt order arrived two days after the promised date.", "resolved", "2026-09-21 10:15:00"),
            (5, "Wrong item received", "Ordered a Gaming Mouse but the box had a keyboard.", "in_progress", "2026-09-19 16:40:00"),
            (9, "Refund status", "Cancelled order 1017 and have not seen the refund yet.", "open", "2026-09-23 09:05:00"),
        ])
    c.commit()
    c.close()