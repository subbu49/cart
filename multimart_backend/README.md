# MultiMart - Multi-Vendor E-Commerce Platform

## 🎉 Phase 1 & 2: COMPLETE ✓

### Implemented Features

#### Phase 1: Authentication, Roles, and Database Setup ✓
All models implemented as per Section 8 of the specification:
- **User** - Custom user model with role field (customer, seller, admin)
- **Shop** - With status field (pending/approved/suspended) for approval workflow
- **Category** - Product categories
- **Product** - With shop FK for multi-vendor isolation
- **Cart & CartItem** - Shopping cart functionality
- **Address** - Customer shipping addresses
- **Order & OrderItem** - **CRITICAL**: OrderItem includes shop FK for per-seller filtering
- **Review** - With is_flagged field for admin moderation
- **Wishlist** - Customer wishlist

**Permission classes implemented:**
- `IsCustomer`, `IsSeller`, `IsAdmin` - Role-specific access
- `IsSellerOrAdmin` - Combined access
- `IsOwnerOrAdmin` - Object-level permissions
- `IsShopOwnerOrAdmin` - **CRITICAL** for multi-vendor isolation

**Authentication System:**
- User registration with role selection
- JWT-based login/logout
- Token refresh endpoint
- Profile management
- Password change
- Token blacklisting on logout (security requirement)

#### Phase 2: Catalog (Shops, Products, Categories) ✓
- **Category Management** - Admin-only CRUD, public read
- **Shop Management** - Seller creates, admin approves, with status workflow
- **Product Management** - Multi-vendor isolated CRUD with role-based filtering
- **Cart System** - Add/update/remove items, price locking
- **Address Management** - Customer shipping addresses
- **Review System** - Customer reviews with admin moderation
- **Wishlist** - Customer wishlist functionality

**Key Implementation:**
- **Multi-Vendor Isolation**: Sellers can ONLY see/edit their own shop's products
- **Shop Approval**: Products only visible after shop approval
- **Role-Based Filtering**: Querysets filtered by role and ownership at ORM level
- **Security**: All isolation rules enforced server-side, not just in UI

#### Security Measures Implemented ✓
✓ Refresh tokens rotate on use  
✓ Tokens blacklisted on logout  
✓ OrderItem.shop validation matches product.shop  
✓ Password validation  
✓ Role-based queryset filtering  
✓ Shop status enforcement server-side  
✓ Cross-shop access attempts blocked at queryset level  

### API Endpoints (Phase 1 & 2)

#### Authentication
```
POST   /api/v1/auth/register/          - User registration
POST   /api/v1/auth/login/             - Login (returns JWT tokens)
POST   /api/v1/auth/logout/            - Logout (blacklist refresh token)
POST   /api/v1/auth/token/refresh/     - Refresh access token
GET    /api/v1/auth/profile/           - Get user profile
PUT    /api/v1/auth/profile/           - Update user profile
POST   /api/v1/auth/change-password/   - Change password
```

#### Catalog
```
GET/POST   /api/v1/categories/              - Category management
GET/POST   /api/v1/shops/                   - Shop management
POST       /api/v1/shops/{id}/approve/      - Approve shop (Admin)
POST       /api/v1/shops/{id}/suspend/      - Suspend shop (Admin)
GET/POST   /api/v1/products/                - Product management
GET        /api/v1/products/?category=1     - Filter by category
GET        /api/v1/products/?shop=2         - Filter by shop
GET        /api/v1/products/?min_price=10&max_price=100
```

#### Customer Features
```
GET        /api/v1/cart/                    - View cart
POST       /api/v1/cart/add_item/           - Add to cart
PATCH      /api/v1/cart/update_item/{id}/   - Update quantity
DELETE     /api/v1/cart/remove_item/{id}/   - Remove item
POST       /api/v1/cart/clear/              - Clear cart

GET/POST   /api/v1/addresses/               - Address management
GET/POST   /api/v1/reviews/                 - Product reviews
POST       /api/v1/reviews/{id}/flag/       - Flag review (Admin)
GET/POST   /api/v1/wishlist/                - Wishlist management
```


### Setup Instructions

#### 1. Virtual Environment (Already Set Up)
The venv is already configured and dependencies are installed.

#### 2. Database Setup
Currently using SQLite for development. The database is already migrated.

**To switch to PostgreSQL (Production):**
1. Install PostgreSQL
2. Create database: `CREATE DATABASE multimart_db;`
3. Edit `config/settings.py` - uncomment PostgreSQL config
4. Run migrations: `.\venv\Scripts\python.exe manage.py migrate`

#### 3. Admin User
Admin user is already created:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

#### 4. Run Development Server
```bash
.\venv\Scripts\python.exe manage.py runserver
```

Server will start at: `http://127.0.0.1:8000/`

### Quick Start - Testing the API

#### 1. Visit API Root
```
http://127.0.0.1:8000/
```
This shows all available endpoints.

#### 2. Run Automated Test Script
```bash
.\venv\Scripts\python.exe test_api.py
```

This script tests:
- User registration (customer & seller)
- Admin login
- Category creation
- Shop creation and approval
- Product management
- Cart operations
- Multi-vendor isolation

#### 3. Manual API Testing

**Register a Customer:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@test.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "role": "customer",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890"
  }'
```

**Login:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "SecurePass123!"
  }'
```

**Browse Products (No auth required):**
```bash
curl http://127.0.0.1:8000/api/v1/products/
```

**View Cart (Customer only):**
```bash
curl http://127.0.0.1:8000/api/v1/cart/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Database Schema Verification

The schema enforces the critical multi-vendor isolation rules:

1. **OrderItem.shop FK** - Enables per-seller filtering (most critical)
2. **Shop.status** - Enforces approval workflow
3. **Review.is_flagged** - Enables admin moderation
4. **OrderItem validation** - Ensures shop matches product.shop

### Next Steps: Phase 2

Once Phase 1 is confirmed working:
- Shop CRUD operations
- Product management with seller isolation
- Category management (admin only)
- Catalog browsing (public)

### Tech Stack
- **Backend**: Django 4.2.23, Django REST Framework
- **Database**: PostgreSQL (SQLite fallback)
- **Authentication**: SimpleJWT with token blacklisting
- **Media**: Pillow for image handling

### Project Structure
```
multimart_backend/
├── authentication/        # User auth and RBAC
│   ├── models.py         # User model
│   ├── serializers.py    # Auth serializers
│   ├── views.py          # Auth views
│   ├── permissions.py    # Permission classes
│   └── urls.py           # Auth routes
├── shop/                 # Shop and product models
│   ├── models.py         # All business models
│   └── admin.py          # Admin configuration
├── config/               # Project settings
│   ├── settings.py       # Main settings
│   └── urls.py           # Root URL config
└── requirements.txt      # Dependencies
```

### Key Implementation Notes

1. **Multi-Vendor Isolation**: The `OrderItem.shop` FK is the foundation for seller data isolation. Every seller query must filter by this field.

2. **Role Enforcement**: All three roles (customer, seller, admin) are enforced at the permission layer, not just in the UI.

3. **Security First**: Token rotation, blacklisting, and shop-ownership validation are implemented from the start per the security checklist.

4. **Admin Moderation**: Shop approval status and review flagging enable proper platform governance.

---

**Phase 1 Status: COMPLETE ✓**
Ready for Phase 2: Catalog (Shops, Products, Categories)
