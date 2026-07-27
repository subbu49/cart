"""
Test script for MultiMart API - Phase 1 & 2
Tests authentication, role-based access, and catalog operations.
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_response(response, title="Response"):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def main():
    print("\n🚀 MultiMart API Test - Phase 1 & 2")
    print("="*60)
    
    # Step 1: Register users
    print("\n1️⃣ Registering Users...")
    
    # Register Customer
    customer_data = {
        "username": "testcustomer",
        "email": "customer@test.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "role": "customer",
        "first_name": "Test",
        "last_name": "Customer",
        "phone": "1234567890"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/register/", json=customer_data)
    print_response(resp, "Customer Registration")
    customer_token = resp.json().get('tokens', {}).get('access') if resp.status_code == 201 else None
    
    # Register Seller
    seller_data = {
        "username": "testseller",
        "email": "seller@test.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "role": "seller",
        "first_name": "Test",
        "last_name": "Seller",
        "phone": "9876543210"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/register/", json=seller_data)
    print_response(resp, "Seller Registration")
    seller_token = resp.json().get('tokens', {}).get('access') if resp.status_code == 201 else None
    
    # Step 2: Login as admin
    print("\n2️⃣ Admin Login...")
    admin_login = {
        "username": "admin",
        "password": "admin123"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/login/", json=admin_login)
    print_response(resp, "Admin Login")
    admin_token = resp.json().get('access') if resp.status_code == 200 else None
    
    # Step 3: Create Categories (Admin)
    print("\n3️⃣ Creating Categories (Admin)...")
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        categories = [
            {"name": "Electronics"},
            {"name": "Clothing"},
            {"name": "Books"}
        ]
        
        for cat in categories:
            resp = requests.post(f"{BASE_URL}/categories/", json=cat, headers=headers)
            print(f"  ✓ Created category: {cat['name']} - Status: {resp.status_code}")
    
    # Step 4: Seller creates Shop
    print("\n4️⃣ Seller Creating Shop...")
    if seller_token:
        headers = {"Authorization": f"Bearer {seller_token}"}
        
        shop_data = {
            "shop_name": "Tech Haven",
            "description": "Your one-stop shop for electronics"
        }
        
        resp = requests.post(f"{BASE_URL}/shops/", json=shop_data, headers=headers)
        print_response(resp, "Shop Creation")
        shop_id = resp.json().get('id') if resp.status_code == 201 else None
        
        # Step 5: Admin approves shop
        if shop_id and admin_token:
            print("\n5️⃣ Admin Approving Shop...")
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            resp = requests.post(f"{BASE_URL}/shops/{shop_id}/approve/", headers=admin_headers)
            print_response(resp, "Shop Approval")
    
    # Step 6: Seller adds Products
    print("\n6️⃣ Seller Adding Products...")
    if seller_token:
        headers = {"Authorization": f"Bearer {seller_token}"}
        
        products = [
            {
                "category": 1,
                "name": "Wireless Mouse",
                "description": "Ergonomic wireless mouse",
                "price": "29.99",
                "discount": "10",
                "stock": 50,
                "status": "active"
            },
            {
                "category": 1,
                "name": "Keyboard",
                "description": "Mechanical keyboard",
                "price": "89.99",
                "discount": "0",
                "stock": 30,
                "status": "active"
            }
        ]
        
        for prod in products:
            resp = requests.post(f"{BASE_URL}/products/", json=prod, headers=headers)
            print(f"  ✓ Created product: {prod['name']} - Status: {resp.status_code}")
    
    # Step 7: Browse Products (Public)
    print("\n7️⃣ Browsing Products (Public)...")
    resp = requests.get(f"{BASE_URL}/products/")
    print_response(resp, "Product Listing")
    
    product_id = None
    if resp.status_code == 200 and resp.json().get('results'):
        product_id = resp.json()['results'][0]['id']
    
    # Step 8: Customer adds to Cart
    print("\n8️⃣ Customer Adding to Cart...")
    if customer_token and product_id:
        headers = {"Authorization": f"Bearer {customer_token}"}
        
        cart_item = {
            "product_id": product_id,
            "quantity": 2
        }
        
        resp = requests.post(f"{BASE_URL}/cart/add_item/", json=cart_item, headers=headers)
        print_response(resp, "Add to Cart")
        
        # View cart
        resp = requests.get(f"{BASE_URL}/cart/", headers=headers)
        print_response(resp, "View Cart")
    
    # Step 9: Test Shop-Owner Isolation
    print("\n9️⃣ Testing Shop-Owner Isolation...")
    if seller_token:
        seller_headers = {"Authorization": f"Bearer {seller_token}"}
        
        # Seller views their products
        resp = requests.get(f"{BASE_URL}/products/", headers=seller_headers)
        print_response(resp, "Seller's Products (should see own only)")
    
    # Step 10: Admin views all
    print("\n🔟 Admin Viewing All Resources...")
    if admin_token:
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        resp = requests.get(f"{BASE_URL}/shops/", headers=admin_headers)
        print(f"  ✓ All Shops: {resp.status_code}")
        
        resp = requests.get(f"{BASE_URL}/products/", headers=admin_headers)
        print(f"  ✓ All Products: {resp.status_code}")
    
    print("\n" + "="*60)
    print("✅ API Test Complete!")
    print("="*60)

if __name__ == "__main__":
    main()
