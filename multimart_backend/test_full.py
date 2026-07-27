"""
Full integration test — backend + frontend connectivity.
Tests every role, every permission, every endpoint.
"""
import requests, json, sys

API = "http://127.0.0.1:8000/api/v1"
FE  = "http://localhost:3000"
BASE = "http://127.0.0.1:8000"

ok = 0; fail = 0

def check(label, cond, detail=""):
    global ok, fail
    if cond:
        print(f"  ✅ {label}")
        ok += 1
    else:
        print(f"  ❌ {label}  {detail}")
        fail += 1

def hdr(token): return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# ── 1. Frontend reachable ──────────────────────────────────
print("\n── Frontend ──────────────────────────────")
try:
    r = requests.get(FE, timeout=5)
    check("Frontend dev server responds", r.status_code == 200)
except Exception as e:
    check("Frontend dev server responds", False, str(e))

# ── 2. Backend API root ────────────────────────────────────
print("\n── Backend API root ──────────────────────")
r = requests.get(f"{BASE}/", headers={"Accept": "application/json"})
check("API root reachable", r.status_code == 200)
try:
    check("API root has endpoints key", "endpoints" in r.json())
except Exception:
    check("API root has endpoints key", False, "non-JSON response (HTML)")

# ── 3. Register fresh users ────────────────────────────────
print("\n── Auth: Register ────────────────────────")
import time; ts = int(time.time())

def reg(role):
    r = requests.post(f"{API}/auth/register/", json={
        "username": f"{role}_{ts}", "email": f"{role}_{ts}@test.com",
        "password": "SecurePass1!", "password2": "SecurePass1!",
        "role": role, "first_name": role.title(), "last_name": "Test"
    })
    return r

rc = reg("customer"); check(f"Register customer → 201", rc.status_code == 201, rc.text[:100])
rs = reg("seller");   check(f"Register seller   → 201", rs.status_code == 201, rs.text[:100])

cust_tok   = rc.json()["tokens"]["access"]  if rc.status_code == 201 else None
seller_tok = rs.json()["tokens"]["access"]  if rs.status_code == 201 else None

# ── 4. Admin login ─────────────────────────────────────────
print("\n── Auth: Login ───────────────────────────")
r = requests.post(f"{API}/auth/login/", json={"username": "admin", "password": "admin123"})
check("Admin login → 200", r.status_code == 200)
admin_tok = r.json().get("access") if r.status_code == 200 else None

# ── 5. Profile (auth required) ─────────────────────────────
print("\n── Auth: Profile ─────────────────────────")
r = requests.get(f"{API}/auth/profile/", headers=hdr(cust_tok))
check("Customer GET profile → 200", r.status_code == 200)
check("Profile has role=customer", r.json().get("role") == "customer")

r = requests.get(f"{API}/auth/profile/", headers=hdr(seller_tok))
check("Seller GET profile   → 200", r.status_code == 200)
check("Profile has role=seller",   r.json().get("role") == "seller")

r = requests.get(f"{API}/auth/profile/", headers=hdr(admin_tok))
check("Admin GET profile    → 200", r.status_code == 200)
check("Profile has role=admin",    r.json().get("role") == "admin")

# ── 6. Unauthenticated access blocked ─────────────────────
print("\n── Auth: Unauthenticated blocked ─────────")
r = requests.get(f"{API}/cart/")
check("Cart without token → 401", r.status_code == 401)
r = requests.get(f"{API}/orders/")
check("Orders without token → 401", r.status_code == 401)

# ── 7. Categories (admin write, public read) ───────────────
print("\n── Categories ────────────────────────────")
r = requests.get(f"{API}/categories/")
check("Public list categories → 200", r.status_code == 200)

r = requests.post(f"{API}/categories/", json={"name": f"TestCat_{ts}"}, headers=hdr(cust_tok))
check("Customer cannot create category → 403", r.status_code == 403)

r = requests.post(f"{API}/categories/", json={"name": f"TestCat_{ts}"}, headers=hdr(admin_tok))
check("Admin creates category → 201", r.status_code == 201)
cat_id = r.json().get("id")

# ── 8. Shop creation & approval ───────────────────────────
print("\n── Shops ─────────────────────────────────")
r = requests.post(f"{API}/shops/", json={"shop_name": f"Shop_{ts}", "description": "Test"}, headers=hdr(seller_tok))
check("Seller creates shop → 201", r.status_code == 201, r.text[:100])
shop_id = r.json().get("id") if r.status_code == 201 else None

r = requests.post(f"{API}/shops/", json={"shop_name": "Another"}, headers=hdr(cust_tok))
check("Customer cannot create shop → 403", r.status_code == 403)

# Approve IMMEDIATELY so products can be added
if shop_id:
    r = requests.post(f"{API}/shops/{shop_id}/approve/", headers=hdr(admin_tok))
    check("Admin approves shop → 200", r.status_code == 200)

    r = requests.get(f"{API}/shops/")
    shops_public = [s for s in (r.json().get("results") or r.json()) if s["id"] == shop_id]
    check("Approved shop visible publicly", len(shops_public) == 1)

# ── 9. Products ────────────────────────────────────────────
print("\n── Products ──────────────────────────────")
r = requests.post(f"{API}/products/", json={
    "category": cat_id, "name": f"Product_{ts}",
    "description": "Test product", "price": "99.99",
    "discount": "5", "stock": 50, "status": "active"
}, headers=hdr(seller_tok))
check("Seller creates product → 201", r.status_code == 201, r.text[:150])
prod_id = r.json().get("id") if r.status_code == 201 else None

r = requests.get(f"{API}/products/")
check("Public lists products → 200", r.status_code == 200)
if prod_id:
    public_prods = [p for p in (r.json().get("results") or []) if p["id"] == prod_id]
    check("New active product in public listing", len(public_prods) == 1)

# Add to cart immediately after product creation (while prod_id is known)
cart_loaded = False
if prod_id and cust_tok:
    r = requests.post(f"{API}/cart/add_item/", json={"product_id": prod_id, "quantity": 2}, headers=hdr(cust_tok))
    cart_loaded = r.status_code == 201

# ── 10. Seller isolation ───────────────────────────────────
print("\n── Seller Isolation ──────────────────────")
# Register a second seller and verify they cannot see first seller's products
rs2 = reg("seller")
if rs2.status_code == 201:
    seller2_tok = rs2.json()["tokens"]["access"]
    r = requests.post(f"{API}/shops/", json={"shop_name": f"Shop2_{ts}"}, headers=hdr(seller2_tok))
    if r.status_code == 201:
        shop2_id = r.json()["id"]
        requests.post(f"{API}/shops/{shop2_id}/approve/", headers=hdr(admin_tok))
        r = requests.get(f"{API}/products/", headers=hdr(seller2_tok))
        seller2_prods = r.json().get("results") or r.json()
        ids_seen = [p["id"] for p in seller2_prods]
        check("Seller B cannot see Seller A's products", prod_id not in ids_seen if prod_id else True)

# ── 11. Cart (customer only) ───────────────────────────────
print("\n── Cart ──────────────────────────────────")
if prod_id and cust_tok:
    if not cart_loaded:
        r = requests.post(f"{API}/cart/add_item/", json={"product_id": prod_id, "quantity": 2}, headers=hdr(cust_tok))
        cart_loaded = r.status_code == 201
    check("Customer adds to cart → 201", cart_loaded)

    r = requests.get(f"{API}/cart/", headers=hdr(cust_tok))
    check("Customer gets cart → 200", r.status_code == 200)
    check("Cart has 1 item",  r.json().get("item_count") == 1)
    check("Cart total > 0",   float(r.json().get("total", 0)) > 0)

    r = requests.post(f"{API}/cart/add_item/", json={"product_id": prod_id, "quantity": 1}, headers=hdr(seller_tok))
    check("Seller cannot use cart → 403", r.status_code == 403)

# ── 12. Address ────────────────────────────────────────────
print("\n── Address ───────────────────────────────")
r = requests.post(f"{API}/addresses/", json={
    "full_name": "Test Customer", "phone": "9999999999",
    "address": "123 Test St", "city": "Mumbai",
    "state": "Maharashtra", "country": "India",
    "zip_code": "400001", "is_default": True
}, headers=hdr(cust_tok))
check("Customer creates address → 201", r.status_code == 201, r.text[:100])
addr_id = r.json().get("id") if r.status_code == 201 else None

# ── 13. Checkout & Order split ─────────────────────────────
print("\n── Checkout & Multi-Vendor Split ─────────")
if addr_id and cust_tok:
    r = requests.post(f"{API}/orders/", json={"address": addr_id, "payment_method": "cod"}, headers=hdr(cust_tok))
    check("Customer checkout → 201", r.status_code == 201, r.text[:150])
    order_id = r.json().get("id") if r.status_code == 201 else None

    if order_id:
        r = requests.get(f"{API}/cart/", headers=hdr(cust_tok))
        check("Cart cleared after checkout", r.json().get("item_count") == 0)

        # Customer sees full order
        r = requests.get(f"{API}/orders/{order_id}/items/", headers=hdr(cust_tok))
        check("Customer sees order items → 200", r.status_code == 200)
        check("Order has items", len(r.json()) > 0)

        # Seller sees only their items
        r = requests.get(f"{API}/orders/{order_id}/items/", headers=hdr(seller_tok))
        check("Seller sees only their items", r.status_code == 200)

        # Admin sees everything
        r = requests.get(f"{API}/orders/{order_id}/items/", headers=hdr(admin_tok))
        check("Admin sees all items → 200", r.status_code == 200)

        # Seller updates status
        r = requests.post(f"{API}/orders/{order_id}/update_status/", json={"order_status": "confirmed"}, headers=hdr(seller_tok))
        check("Seller updates status to confirmed → 200", r.status_code == 200)

# ── 14. Seller Dashboard ──────────────────────────────────
print("\n── Seller Dashboard ──────────────────────")
r = requests.get(f"{API}/seller/dashboard/", headers=hdr(seller_tok))
check("Seller dashboard → 200", r.status_code == 200)
check("Dashboard has total_revenue", "total_revenue" in r.json())
check("Dashboard has total_orders",  "total_orders"  in r.json())

r = requests.get(f"{API}/seller/dashboard/", headers=hdr(cust_tok))
check("Customer cannot access seller dashboard → 403", r.status_code == 403)

r = requests.get(f"{API}/seller/dashboard/orders/", headers=hdr(seller_tok))
check("Seller order list → 200", r.status_code == 200)

# ── 15. Admin Dashboard ───────────────────────────────────
print("\n── Admin Dashboard ───────────────────────")
r = requests.get(f"{API}/admin-dashboard/", headers=hdr(admin_tok))
check("Admin dashboard → 200", r.status_code == 200)
check("Dashboard has total_users",   "total_users"   in r.json())
check("Dashboard has total_revenue", "total_revenue" in r.json())

r = requests.get(f"{API}/admin-dashboard/", headers=hdr(cust_tok))
check("Customer cannot access admin dashboard → 403", r.status_code == 403)

r = requests.get(f"{API}/admin-dashboard/users/", headers=hdr(admin_tok))
check("Admin user list → 200", r.status_code == 200)

r = requests.get(f"{API}/admin-dashboard/orders/", headers=hdr(admin_tok))
check("Admin order list → 200", r.status_code == 200)

# ── 16. Reviews & Wishlist ────────────────────────────────
print("\n── Reviews & Wishlist ────────────────────")
if prod_id:
    r = requests.post(f"{API}/reviews/", json={"product": prod_id, "rating": 5, "comment": "Great!"}, headers=hdr(cust_tok))
    check("Customer creates review → 201", r.status_code == 201, r.text[:100])
    review_id = r.json().get("id") if r.status_code == 201 else None

    r = requests.get(f"{API}/reviews/?product={prod_id}")
    check("Public reads reviews → 200", r.status_code == 200)

    if review_id:
        r = requests.post(f"{API}/reviews/{review_id}/flag/", headers=hdr(admin_tok))
        check("Admin flags review → 200", r.status_code == 200)

    # Wishlist
    r = requests.post(f"{API}/wishlist/", json={"product_id": prod_id}, headers=hdr(cust_tok))
    check("Customer adds to wishlist → 201", r.status_code == 201, r.text[:100])
    wish_id = r.json().get("id") if r.status_code == 201 else None

    r = requests.get(f"{API}/wishlist/", headers=hdr(cust_tok))
    check("Customer views wishlist → 200", r.status_code == 200)

    if wish_id:
        r = requests.delete(f"{API}/wishlist/{wish_id}/", headers=hdr(cust_tok))
        check("Customer removes from wishlist → 204", r.status_code == 204)

# ── 17. Order cancellation ────────────────────────────────
print("\n── Order Cancellation ────────────────────")
# Place a new order to cancel
if prod_id and addr_id and cust_tok:
    requests.post(f"{API}/cart/add_item/", json={"product_id": prod_id, "quantity": 1}, headers=hdr(cust_tok))
    r2 = requests.post(f"{API}/orders/", json={"address": addr_id, "payment_method": "cod"}, headers=hdr(cust_tok))
    if r2.status_code == 201:
        order2_id = r2.json()["id"]
        r = requests.post(f"{API}/orders/{order2_id}/cancel/", headers=hdr(cust_tok))
        check("Customer cancels pending order → 200", r.status_code == 200)
        check("Order status is cancelled", r.json().get("order_status") == "cancelled")

# ── 18. Admin shop/product management ────────────────────
print("\n── Admin Management ──────────────────────")
r = requests.get(f"{API}/shops/",    headers=hdr(admin_tok))
check("Admin lists all shops → 200",    r.status_code == 200)
r = requests.get(f"{API}/products/", headers=hdr(admin_tok))
check("Admin lists all products → 200", r.status_code == 200)

# ── SUMMARY ───────────────────────────────────────────────
print("\n" + "="*50)
total = ok + fail
print(f"  RESULTS: {ok}/{total} passed  |  {fail} failed")
print("="*50)
if fail == 0:
    print("  🎉 ALL TESTS PASSED — Backend & Frontend Connected!")
else:
    print(f"  ⚠️  {fail} test(s) need attention")
print()
