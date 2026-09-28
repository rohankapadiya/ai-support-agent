import os, json
from dotenv import load_dotenv
from openai import OpenAI
from tools import SCHEMAS, dispatch

load_dotenv()
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)
MODEL = os.getenv("MODEL", "openai/gpt-oss-120b")

SYSTEM = """You are a friendly customer support agent for an online store.
Rules:
- Use tools to get real data. NEVER guess order status, stock, or tracking info.
- Before cancel_order or update_address, state exactly what you'll do and ask the customer to confirm. Only call the tool after they say yes.
- If a tool returns an error, explain it plainly. If you can't resolve the issue, offer to create a support ticket.
- Keep replies short and clear. Only discuss this store's orders and products."""


def run_agent(history, customer_id, max_steps=6):
    messages = [{"role": "system", "content": SYSTEM}] + history
    trace = []
    for _ in range(max_steps):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=SCHEMAS,
            tool_choice="auto",
            temperature=0.2,
        )
        msg = resp.choices[0].message
        if not msg.tool_calls:
            return msg.content, trace

        messages.append(
            {
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id": t.id,
                        "type": "function",
                        "function": {
                            "name": t.function.name,
                            "arguments": t.function.arguments,
                        },
                    }
                    for t in msg.tool_calls
                ],
            }
        )
        for t in msg.tool_calls:
            args = json.loads(t.function.arguments or "{}")
            result = dispatch(t.function.name, args, customer_id)
            trace.append({"tool": t.function.name, "args": args, "result": result})
            messages.append(
                {"role": "tool", "tool_call_id": t.id, "content": json.dumps(result)}
            )
    return "Sorry, I'm having trouble completing that. Could you rephrase?", trace
