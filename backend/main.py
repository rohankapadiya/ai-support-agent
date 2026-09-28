import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from db import init_db, conn
from agent import run_agent

load_dotenv()


@asynccontextmanager
async def lifespan(app):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
]
app.add_middleware(
    CORSMiddleware, allow_origins=ORIGINS, allow_methods=["*"], allow_headers=["*"]
)


class Msg(BaseModel):
    role: str
    content: str


class ChatReq(BaseModel):
    customer_id: int
    messages: list[Msg]


@app.get("/customers")
def customers():
    rows = conn().execute("""
        SELECT c.id, c.name, c.email, c.phone,
               (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
        FROM customers c""").fetchall()
    return [dict(r) for r in rows]


@app.get("/customers/{customer_id}/orders")
def customer_orders(customer_id: int):
    rows = (
        conn()
        .execute(
            """
        SELECT o.id, p.name AS product, p.price, o.qty, (p.price * o.qty) AS total,
               o.status, o.address, o.tracking, o.eta
        FROM orders o JOIN products p ON p.sku = o.sku
        WHERE o.customer_id = ? ORDER BY o.id DESC""",
            (customer_id,),
        )
        .fetchall()
    )
    return [dict(r) for r in rows]


@app.get("/customers/{customer_id}/tickets")
def customer_tickets(customer_id: int):
    rows = (
        conn()
        .execute(
            "SELECT id, subject, description, status, created_at FROM tickets "
            "WHERE customer_id = ? ORDER BY id DESC",
            (customer_id,),
        )
        .fetchall()
    )
    return [dict(r) for r in rows]


@app.post("/chat")
def chat(req: ChatReq):
    history = [m.model_dump() for m in req.messages][-20:]
    try:
        reply, trace = run_agent(history, req.customer_id)
    except Exception as e:
        print("Agent error:", e)
        return {
            "reply": "Sorry, something went wrong on our side. Please try again.",
            "trace": [],
        }
    return {"reply": reply, "trace": trace}


@app.post("/reset")
def reset():
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
    return {"ok": True}


@app.get("/health")
def health():
    return {"ok": True}
