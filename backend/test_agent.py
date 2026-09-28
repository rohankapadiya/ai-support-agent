from db import init_db
from agent import run_agent

init_db()

# Test 1: a simple lookup
history = [{"role": "user", "content": "Where is my order 1002?"}]
reply, trace = run_agent(history, customer_id=1)
print("TOOLS USED:", [t["tool"] for t in trace])
print("REPLY:", reply)
print()

# Test 2: cancel flow, step A (should ask for confirmation, NOT cancel yet)
history = [{"role": "user", "content": "Cancel order 1001"}]
reply, trace = run_agent(history, customer_id=1)
print("TOOLS USED:", [t["tool"] for t in trace])
print("REPLY:", reply)
print()

# Test 2: step B (customer confirms, now it should cancel)
history += [{"role": "assistant", "content": reply},
            {"role": "user", "content": "Yes, please cancel it"}]
reply, trace = run_agent(history, customer_id=1)
print("TOOLS USED:", [t["tool"] for t in trace])
print("REPLY:", reply)