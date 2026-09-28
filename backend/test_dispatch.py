import json
from db import init_db
from tools import SCHEMAS, dispatch

init_db()

print(json.dumps(SCHEMAS[1], indent=2))       # what the LLM sees for get_order
print()
print(dispatch("get_order", {"order_id": 1002}, 1))
print(dispatch("get_order", {"order_id": 1002, "customer_id": 2}, 1))  # LLM tries to pose as customer 2
print(dispatch("get_order", {"order_id": 1003}, 1))                    # someone else's order
print(dispatch("delete_everything", {}, 1))                            # tool that doesn't exist
print(dispatch("get_order", {}, 1))                                    # missing argument