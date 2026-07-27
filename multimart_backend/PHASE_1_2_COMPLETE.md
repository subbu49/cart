# MultiMart - Phase 1 & 2 Complete ✅

## What's Been Built

### Phase 1: Authentication, Roles & Database ✓

#### Database Schema
All models implemented with security requirements:

1. **User Model** - Custom user with role field (customer/seller/admin)
2. **Shop Model** - With status approval workflow (pending/approved/suspended)
3. **Category Model** - Product categories
4. **Product Model** - Multi-vendor isolation via shop FK
5. **Cart & CartItem** - Shopping cart
6. **Address** - Customer shipping addresses
7. **Order & OrderItem** - **CRITICAL**: OrderItem.shop FK enables per-seller filtering
8. **Review** - With is_flagged for moderation
9. **Wishlist** - Customer wishlist

#### Authentication System
- JWT-based auth with token blacklisting
- User registration with role selection
- Login/Logout with refresh token rotation
- Profile management
- Password change
- Token refresh endpoint

#### Permission Classes (RBAC)
- `IsCustomer` - Customer-only access
- `IsSeller` - Seller-only access  
- `IsAdmin` - Admin-only access
- `IsSellerOrAdmin` - Combined access
- `IsOwnerOrAdmin` - Object-level permissions
- `IsShopOwnerOrAdmin` - **CRITICAL** for multi-vendor isolation

### Phase 2: Catalog (Shops, Products, Categories) ✓

#### Category Management
- **Public**: Browse categories
- **Admin**: Full CRUD operations

**Endpoints:**
```
GET    /api/v1/categories/       - List categories
POST   /api/v1/categories/       - Create (Admin only)
GET    /api/v1/categories/{id}/  - Get category
PUT    /api/v1/categories/{id}/  - Update (Admin only)
DELETE /api/v1/categories/{id}/  - Delete (Admin only)
```

#### Shop Management
- **Public**: View approved shops only
- **Seller**: Create and manage own shop
- **Admin**: Approve/suspend shops, manage all

**Endpoints:**
```
GET    /api/v1/shops/              - List shops (filtered by role)
POST   /api/v1/shops/              - Create shop (Seller only)
GET    /api/v1/shops/{id}/         - Get shop details
PUT    /api/v1/shops/{id}/         - Update shop (Owner/Admin)
DELETE /api/v1/shops/{id}/         - Delete shop (Owner/Admin)
POST   /api/v1/shops/{id}/approve/ - Approve shop (Admin only)
POST   /api/v1/shops/{id}/suspend/ - Suspend shop (Admin only)
```

**Key Features:**
- Sellers can only create ONE shop
- Shop requires admin approval before products go live
- Status transitions enforced server-side

#### Product Management
- **Public**: Browse active products from approved shops
- **Seller**: CRUD on own shop's products only (multi-vendor isolation)
- **Admin**: Full access to all products

**Endpoints:**
```
GET    /api/v1/products/           - List products (filtered by role)
POST   /api/v1/products/           - Create product (Seller only)
GET    /api/v1/products/{id}/      - Get product details
PUT    /api/v1/products/{id}/      - Update product (Owner/Admin)
DELETE /api/v1/products/{id}/      - Delete product (Owner/Admin)
```

**Query Parameters:**
- `?category=1` - Filter by category
- `?shop=2` - Filter by shop
- `?min_price=10&max_price=100` - Price range
- `?search=keyword` - Search in name/description

**Key Features:**
- **CRITICAL**: Sellers can ONLY see/edit products from their own shop
- Products must belong to approved shops to be visible publicly
- Price discount calculation included

#### Cart Management
- Customer-only feature
- Add/update/remove items
- Clear cart
- Price locked at cart-add time

**Endpoints:**
```
GET    /api/v1/cart/                        - View cart
POST   /api/v1/cart/add_item/               - Add item to cart
PATCH  /api/v1/cart/update_item/{item_id}/  - Update quantity
DELETE /api/v1/cart/remove_item/{item_id}/  - Remove item
POST   /api/v1/cart/clear/                  - Clear cart
```

#### Address Management
- Customer addresses for shipping
- Default address support

**Endpoints:**
```
GET    /api/v1/addresses/     - List customer addresses
POST   /api/v1/addresses/     - Add address
PUT    /api/v1/addresses/{id}/ - Update address
DELETE /api/v1/addresses/{id}/ - Delete address
```

#### Review & Wishlist
- Reviews with admin moderation
- Wishlist for customers

**Endpoints:**
```
GET    /api/v1/reviews/?product=1  - Get product reviews
POST   /api/v1/reviews/            - Add review (Customer)
POST   /api/v1/reviews/{id}/flag/  - Flag review (Admin)

GET    /api/v1/wishlist/           - View wishlist
POST   /api/v1/wishlist/           - Add to wishlist
DELETE /api/v1/wishlist/{id}/      - Remove from wishlist
```

## Multi-Vendor Isolation Implementation

### How It Works (Per Spec Section 7)

1. **Shop Ownership**: Every product belongs to a shop via FK
2. **OrderItem.shop FK**: **CRITICAL** - enables per-seller order filtering
3. **Queryset Filtering**: All seller views filter by `shop__owner=request.user`
4. **Permission Enforcement**: `IsShopOwnerOrAdmin` checks shop ownership
5. **Validation**: `OrderItem.save()` validates shop matches product.shop

### Security Measures Implemented ✓

Per Section 11 (Security Hardening Checklist):

✅ Role and shop-ownership filtering in querysets (not just UI)  
✅ Refresh tokens rotate on use  
✅ Tokens blacklisted on logout  
✅ OrderItem.shop validation matches product.shop  
✅ Password validation  
✅ Shop status transitions enforced server-side  
✅ Product status checks before purchase  

## API Surface Summary

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

### Catalog (Phase 2)
```
/api/v1/categories/   - Category CRUD (Admin)
/api/v1/shops/        - Shop management (Role-based)
/api/v1/products/     - Product management (Multi-vendor isolated)
/api/v1/cart/         - Shopping cart (Customer)
/api/v1/addresses/    - Address management (Customer)
/api/v1/reviews/      - Product reviews
/api/v1/wishlist/     - Customer wishlist
```

## Testing

### Quick Test
1. **Start server**:
   ```bash
   .\venv\Scripts\python.exe manage.py runserver
   ```

2. **Run test script**:
   ```bash
   .\venv\Scripts\python.exe test_api.py
   ```

### Manual Test Flow
1. **Register users** (customer, seller via `/api/v1/auth/register/`)
2. **Login as admin** (`username: admin`, `password: admin123`)
3. **Create categories** (admin)
4. **Seller creates shop** (requires approval)
5. **Admin approves shop**
6. **Seller adds products**
7. **Customer browses and adds to cart**
8. **Test isolation**: Seller can only see own products

### Test Multi-Vendor Isolation
```bash
# As Seller A - should only see Seller A's products
curl -H "Authorization: Bearer <seller_a_token>" \
  http://localhost:8000/api/v1/products/

# As Admin - should see ALL products
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:8000/api/v1/products/
```

## Database
- Currently using SQLite for development
- To switch to PostgreSQL (per spec), edit `config/settings.py`

## What's Next: Phase 3

### Transactions (Orders & Multi-Vendor Split)
- [x] Order model created
- [x] OrderItem with shop FK implemented
- [ ] Complete checkout flow
- [ ] Order status management
- [ ] Seller order dashboard (filtered by shop)
- [ ] Customer order history
- [ ] Multi-vendor notification system

### Key Features to Implement
1. **Checkout**: Convert cart → order with OrderItem split
2. **Seller Dashboard**: See only their OrderItems
3. **Order Status**: Track order lifecycle
4. **Customer Orders**: Full order history

## Tech Stack
- Django 4.2.23
- Django REST Framework 3.14.0
- SimpleJWT 5.3.1
- PostgreSQL / SQLite
- Pillow (image handling)

## Project Structure
```
multimart_backend/
├── authentication/
│   ├── models.py              # User model
│   ├── serializers.py         # Auth serializers
│   ├── views.py               # Auth endpoints
│   ├── permissions.py         # RBAC permission classes
│   └── urls.py
├── shop/
│   ├── models.py              # All business models
│   ├── serializers.py         # Shop, Product, Cart, Order serializers
│   ├── views.py               # ViewSets with role filtering
│   ├── urls.py
│   └── admin.py               # Admin interface
├── config/
│   ├── settings.py
│   └── urls.py
├── requirements.txt
├── README.md
├── test_api.py                # API test script
└── manage.py
```

## Key Files to Review

### Critical Security Files
1. `authentication/permissions.py` - RBAC permission classes
2. `shop/views.py` - Role-based queryset filtering (lines 50-80, 150-180)
3. `shop/models.py` - OrderItem.save() validation (line 180)

### Core Business Logic
1. `shop/views.py` - ProductViewSet.get_queryset() (multi-vendor isolation)
2. `shop/views.py` - OrderViewSet (order splitting logic)
3. `shop/serializers.py` - All business entity serializers

## Verification Checklist

### Phase 1 ✅
- [x] Custom User model with role field
- [x] JWT authentication working
- [x] Token blacklisting on logout
- [x] Permission classes for RBAC
- [x] All database models migrated

### Phase 2 ✅
- [x] Category management (admin-only)
- [x] Shop CRUD with approval workflow
- [x] Product CRUD with shop isolation
- [x] Cart functionality
- [x] Address management
- [x] Review system with moderation
- [x] Wishlist feature
- [x] Multi-vendor isolation enforced
- [x] Role-based queryset filtering

### Security ✅
- [x] Shop-ownership checks at queryset level
- [x] Sellers cannot access other sellers' data
- [x] Admin has full access
- [x] Customers see only public/approved content
- [x] Token rotation and blacklisting
- [x] OrderItem.shop validation

---

**Status**: Phase 1 & 2 COMPLETE ✅  
**Next**: Phase 3 - Complete Order Management & Checkout Flow  
**Spec Compliance**: Following MultiMart Technical Specification v1.0
