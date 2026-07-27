"""
URL configuration for shop app.
All routes under /api/v1/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ShopViewSet,
    ProductViewSet,
    CartViewSet,
    AddressViewSet,
    OrderViewSet,
    SellerDashboardView,
    AdminDashboardView,
    ReviewViewSet,
    WishlistViewSet,
)

app_name = 'shop'

router = DefaultRouter()
router.register(r'categories',       CategoryViewSet,      basename='category')
router.register(r'shops',            ShopViewSet,          basename='shop')
router.register(r'products',         ProductViewSet,       basename='product')
router.register(r'cart',             CartViewSet,          basename='cart')
router.register(r'addresses',        AddressViewSet,       basename='address')
router.register(r'orders',           OrderViewSet,         basename='order')
router.register(r'seller/dashboard', SellerDashboardView,  basename='seller-dashboard')
router.register(r'admin-dashboard',  AdminDashboardView,   basename='admin-dashboard')
router.register(r'reviews',          ReviewViewSet,        basename='review')
router.register(r'wishlist',         WishlistViewSet,      basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
]
