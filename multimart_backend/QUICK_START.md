# MultiMart - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Start the Server
```bash
cd c:\Users\sumanth.nerella\ecart\multimart_backend
.\venv\Scripts\python.exe manage.py runserver
```

✅ Server running at: **http://127.0.0.1:8000/**

---

### 2. Access the API

#### API Root
```
http://127.0.0.1:8000/
```
Shows all available endpoints with examples.

#### Admin Panel
```
http://127.0.0.1:8000/admin/
Username: admin
Password: admin123
```

---

### 3. Test the API

#### Option A: Run Automated Test Script
```bash
.\venv\Scripts\python.exe test_api.py
```

This tests everything:
- User registration
- Authentication
- Shop & product management
- Cart operations
- Multi-vendor isolation

#### Option B: Manual Testing with Browser

**Visit these URLs directly:**

1. **API Root**: http://127.0.0.1:8000/
2. **Browse Categories**: http://127.0.0.1:8000/api/v1/categories/
3. **Browse Shops**: http://127.0.0.1:8000/api/v1/shops/
4. **Browse Products**: http://127.0.0.1:8000/api/v1/products/

---

## 📝 Quick API Reference

### Register a User
```http
POST http://127.0.0.1:8000/api/v1/auth/register/
Content-Type: application/json

{
  "username": "john",
  "email": "john@test.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "customer",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890"
}
```

**Roles:** `customer`, `seller`, or `admin`

### Login
```http
POST http://127.0.0.1:8000/api/v1/auth/login/
Content-Type: application/json

{
  "username": "john",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Use Protected Endpoints
Add the access token to your requests:
```http
GET http://127.0.0.1:8000/api/v1/cart/
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🎯 Common Workflows

### As a Customer

1. **Register** as customer
2. **Browse** products: `GET /api/v1/products/`
3. **Add to cart**: `POST /api/v1/cart/add_item/`
4. **View cart**: `GET /api/v1/cart/`
5. **Add address**: `POST /api/v1/addresses/`
6. **Checkout**: `POST /api/v1/orders/` (Phase 3)

### As a Seller

1. **Register** as seller
2. **Create shop**: `POST /api/v1/shops/`
3. **Wait for admin approval** (check status in admin panel)
4. **Add products**: `POST /api/v1/products/`
5. **Manage products**: `GET /api/v1/products/` (see only your products)
6. **View orders**: `GET /api/v1/orders/` (see only your order items)

### As Admin

1. **Login** with `admin` / `admin123`
2. **Approve shops**: `POST /api/v1/shops/{id}/approve/`
3. **Manage categories**: `POST /api/v1/categories/`
4. **View all**: All endpoints return full data for admin
5. **Moderate reviews**: `POST /api/v1/reviews/{id}/flag/`

---

## 🔧 Development Commands

### Check for errors
```bash
.\venv\Scripts\python.exe manage.py check
```

### Create new migrations (after model changes)
```bash
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate
```

### Create users via shell
```bash
.\venv\Scripts\python.exe manage.py shell
```
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Create customer
User.objects.create_user(
    username='customer1',
    email='customer1@test.com',
    password='pass123',
    role='customer'
)

# Create seller
User.objects.create_user(
    username='seller1',
    email='seller1@test.com',
    password='pass123',
    role='seller'
)
```

### View all routes
```bash
.\venv\Scripts\python.exe manage.py show_urls
```

---

## 📚 API Endpoints Summary

### Authentication
```
POST   /api/v1/auth/register/
POST   /api/v1/auth/login/
POST   /api/v1/auth/logout/
POST   /api/v1/auth/token/refresh/
GET    /api/v1/auth/profile/
PUT    /api/v1/auth/profile/
POST   /api/v1/auth/change-password/
```

### Catalog
```
GET/POST    /api/v1/categories/
GET/POST    /api/v1/shops/
POST        /api/v1/shops/{id}/approve/
POST        /api/v1/shops/{id}/suspend/
GET/POST    /api/v1/products/
GET         /api/v1/products/{id}/
```

### Customer
```
GET         /api/v1/cart/
POST        /api/v1/cart/add_item/
PATCH       /api/v1/cart/update_item/{id}/
DELETE      /api/v1/cart/remove_item/{id}/
POST        /api/v1/cart/clear/

GET/POST    /api/v1/addresses/
GET/POST    /api/v1/reviews/
GET/POST    /api/v1/wishlist/
GET/POST    /api/v1/orders/
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check for errors
.\venv\Scripts\python.exe manage.py check

# Ensure venv is correct
.\venv\Scripts\python.exe -c "import django; print(django.get_version())"
# Should show: 4.2.23
```

### "Module not found" errors
```bash
# Reinstall dependencies
.\venv\Scripts\pip.exe install -r requirements.txt
```

### Database errors
```bash
# Reset database (CAUTION: deletes all data)
del db.sqlite3
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py setup_admin
```

### Can't access admin panel
```bash
# Reset admin password
.\venv\Scripts\python.exe manage.py setup_admin
```

---

## 📖 Documentation

- **README.md** - Full setup guide
- **PHASE_1_2_COMPLETE.md** - Feature details
- **BUILD_STATUS.md** - Implementation status & spec compliance
- **test_api.py** - Automated test examples

---

## ✅ Verify Installation

Run these checks:

1. **Server health:**
   ```bash
   .\venv\Scripts\python.exe manage.py check
   ```
   Expected: "System check identified no issues"

2. **Database:**
   ```bash
   .\venv\Scripts\python.exe manage.py showmigrations
   ```
   Expected: All migrations marked with [X]

3. **Admin access:**
   Visit http://127.0.0.1:8000/admin/
   Login: admin / admin123

4. **API root:**
   Visit http://127.0.0.1:8000/
   Should see JSON with endpoint list

---

**All checks passed?** ✅ You're ready to build!

**Phase 1 & 2 Complete** ✓  
**Next:** Phase 3 - Order Management
