from db import conn


def get_customer(customer_id, **_):
    c = conn()
    row = c.execute("SELECT * FROM customers WHERE id=?", (customer_id,)).fetchone()
    return dict(row) if row else {"error": "Customer not found"}


def get_order(customer_id, order_id, **_):
    c = conn()
    row = c.execute(
        """SELECT o.*, p.name AS product FROM orders o
        JOIN products p ON p.sku=o.sku
        WHERE o.id=? AND o.customer_id=?""",
        (order_id, customer_id),
    ).fetchone()
    return dict(row) if row else {"error": "Order not found for this customer"}


def cancel_order(customer_id, order_id, **_):
    c = conn()
    row = c.execute(
        "SELECT status FROM orders WHERE id=? AND customer_id=?",
        (order_id, customer_id),
    ).fetchone()
    if not row:
        return {"error": "Order not found for this customer"}
    if row["status"] != "processing":
        return {"error": f"Cannot cancel: order is already {row['status']}"}
    c.execute("UPDATE orders SET status='cancelled' WHERE id=?", (order_id,))
    c.commit()
    return {"success": True, "order_id": order_id, "new_status": "cancelled"}


def update_address(customer_id, order_id, new_address, **_):
    c = conn()
    row = c.execute(
        "SELECT status FROM orders WHERE id=? AND customer_id=?",
        (order_id, customer_id),
    ).fetchone()
    if not row:
        return {"error": "Order not found for this customer"}
    if row["status"] != "processing":
        return {"error": f"Cannot change address: order is already {row['status']}"}
    c.execute("UPDATE orders SET address=? WHERE id=?", (new_address, order_id))
    c.commit()
    return {"success": True, "order_id": order_id, "address": new_address}


def check_inventory(product_name, **_):
    c = conn()
    rows = c.execute(
        "SELECT sku, name, stock, price FROM products WHERE name LIKE ?",
        (f"%{product_name}%",),
    ).fetchall()
    return [dict(r) for r in rows] or {"error": "No matching product"}


def create_ticket(customer_id, subject, description, **_):
    c = conn()
    cur = c.execute(
        "INSERT INTO tickets(customer_id, subject, description) VALUES (?,?,?)",
        (customer_id, subject, description),
    )
    c.commit()
    return {"success": True, "ticket_id": cur.lastrowid}

REGISTRY = {f.__name__: f for f in
            [get_customer, get_order, cancel_order, update_address, check_inventory, create_ticket]}

def fn(name, desc, props=None, required=None):
    return {"type": "function", "function": {
        "name": name, "description": desc,
        "parameters": {"type": "object", "properties": props or {}, "required": required or []}}}

SCHEMAS = [
    fn("get_customer", "Get the current customer's profile (name, email, phone)."),
    fn("get_order", "Look up an order's status, tracking number, ETA and address.",
       {"order_id": {"type": "integer"}}, ["order_id"]),
    fn("cancel_order", "Cancel an order. Only call AFTER the customer has explicitly confirmed.",
       {"order_id": {"type": "integer"}}, ["order_id"]),
    fn("update_address", "Change an order's shipping address. Only call AFTER the customer confirmed the new address.",
       {"order_id": {"type": "integer"}, "new_address": {"type": "string"}}, ["order_id", "new_address"]),
    fn("check_inventory", "Check stock and price for a product by name.",
       {"product_name": {"type": "string"}}, ["product_name"]),
    fn("create_ticket", "Create a human-support ticket when you cannot resolve the issue.",
       {"subject": {"type": "string"}, "description": {"type": "string"}}, ["subject", "description"]),
]

def dispatch(name, args, customer_id):
    if name not in REGISTRY:
        return {"error": f"Unknown tool {name}"}
    args = {k: v for k, v in args.items() if k != "customer_id"}
    try:
        return REGISTRY[name](customer_id=customer_id, **args)
    except TypeError as e:
        return {"error": f"Bad arguments: {e}"}