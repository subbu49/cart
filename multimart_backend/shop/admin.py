from django.contrib import admin
from .models import (
    Shop, Category, Product, Cart, CartItem,
    Address, Order, OrderItem, Review, Wishlist
)


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'owner', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['shop_name', 'owner__username']
    readonly_fields = ['created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'shop', 'category', 'price', 'discount', 'stock', 'status', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['name', 'shop__shop_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['customer', 'created_at']
    search_fields = ['customer__username']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'price']
    search_fields = ['cart__customer__username', 'product__name']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['customer', 'full_name', 'city', 'state', 'country', 'is_default']
    list_filter = ['is_default', 'state', 'country']
    search_fields = ['customer__username', 'full_name', 'city']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'payment_method', 'payment_status', 'order_status', 'total_amount', 'created_at']
    list_filter = ['payment_status', 'order_status', 'payment_method', 'created_at']
    search_fields = ['customer__username', 'id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'shop', 'quantity', 'price']
    list_filter = ['shop']
    search_fields = ['order__id', 'product__name', 'shop__shop_name']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['customer', 'product', 'rating', 'is_flagged', 'created_at']
    list_filter = ['rating', 'is_flagged', 'created_at']
    search_fields = ['customer__username', 'product__name']
    readonly_fields = ['created_at']
    actions = ['flag_review', 'unflag_review']
    
    def flag_review(self, request, queryset):
        queryset.update(is_flagged=True)
    flag_review.short_description = "Flag selected reviews"
    
    def unflag_review(self, request, queryset):
        queryset.update(is_flagged=False)
    unflag_review.short_description = "Unflag selected reviews"


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['customer', 'product', 'created_at']
    search_fields = ['customer__username', 'product__name']
