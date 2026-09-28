from db import init_db
from tools import *

init_db()

print(get_customer(1))
print(get_order(1, 1002))                     # Aarav's shipped order
print(get_order(1, 1003))                     # Priya's order, should be blocked
print(update_address(1, 1001, "99 Athwa Lines, Surat"))
print(cancel_order(1, 1002))                  # shipped, should be refused
print(cancel_order(1, 1001))                  # processing, should work
print(cancel_order(1, 1001))                  # already cancelled, should be refused
print(check_inventory("shirt"))
print(create_ticket(1, "Broken item", "Arrived damaged"))