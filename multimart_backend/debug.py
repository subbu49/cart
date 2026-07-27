import requests, json, time

API  = "http://127.0.0.1:8000/api/v1"
BASE = "http://127.0.0.1:8000"

ts = int(time.time())

def hdr(t): return {"Authorization": f"Bearer {t}"}

# --- API ROOT ---
print("=== API ROOT ===")
r = requests.get(BASE + "/", headers={"Accept": "application/json"})
print(r.status_code, r.text[:100])

# --- REGISTER FRESH USERS ---
print("\n=== REGISTER ===")
def reg(role):
    return requests.post(f"{API}/auth/register/", json={
        "username": f"{role}_{ts}", "email": f"{role}_{ts}@test.com",
        "password": "Pass1234!", "password2": "Pass1234!",
        "role": role, "first_name": role.title(), "last_name": "Debug"
    })

rc = reg("customer"); print("customer:", rc.status_code)
rs = reg("seller");   print("seller:",   rs.status_code)

cust_tok   = rc.json()["tokens"]["access"]
seller_tok = rs.json()["tokens"]["access"]

# admin
ra = requests.post(f"{API}/auth/login/", json={"username": "admin", "password": "admin123"})
admin_tok = ra.json()["access"]
print("admin:", ra.status_code)

# --- CATEGORY ---
print("\n=== CATEGORY ===")
rc2 = requests.post(f"{API}/categories/", json={"name": f"Cat_{ts}"}, headers=hdr(admin_tok))
cat_id = rc2.json()["id"]
print("cat created:", rc2.status_code, cat_id)

# --- SHOP ---
print("\n=== SHOP ===")
rshop = requests.post(f"{API}/shops/", json={"shop_name": f"Shop_{ts}"}, headers=hdr(seller_tok))
print("shop create:", rshop.status_code, rshop.text[:100])
shop_id = rshop.json().get("id")

rapp = requests.post(f"{API}/shops/{shop_id}/approve/", headers=hdr(admin_tok))
print("shop approve:", rapp.status_code)

# --- PRODUCT ---
print("\n=== PRODUCT ===")
rprod = requests.post(f"{API}/products/", json={
    "category": cat_id, "name": f"Prod_{ts}",
    "description": "test", "price": "49.99",
    "discount": "0", "stock": 100, "status": "active"
}, headers=hdr(seller_tok))
print("product create:", rprod.status_code, rprod.text[:150])
prod_id = rprod.json().get("id")

# --- CART ---
print("\n=== CART ===")
radd = requests.post(f"{API}/cart/add_item/", json={"product_id": prod_id, "quantity": 2}, headers=hdr(cust_tok))
print("add to cart:", radd.status_code, radd.text[:100])

rcart = requests.get(f"{API}/cart/", headers=hdr(cust_tok))
print("get cart:", rcart.status_code, json.dumps(rcart.json(), indent=2)[:200])

# --- ADDRESS ---
print("\n=== ADDRESS ===")
raddr = requests.post(f"{API}/addresses/", json={
    "full_name": "Debug User", "phone": "9999999999",
    "address": "123 St", "city": "City",
    "state": "State", "country": "India", "zip_code": "123456"
}, headers=hdr(cust_tok))
print("address:", raddr.status_code, raddr.text[:100])
addr_id = raddr.json().get("id")

# --- CHECKOUT ---
print("\n=== CHECKOUT ===")
rorder = requests.post(f"{API}/orders/", json={
    "address": addr_id, "payment_method": "cod"
}, headers=hdr(cust_tok))
print("checkout:", rorder.status_code, rorder.text[:300])
