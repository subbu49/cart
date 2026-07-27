"""
Serializers for shop, products, categories, and related models.
Single canonical file — no duplicates.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Shop, Category, Product, Cart, CartItem,
    Address, Order, OrderItem, Review, Wishlist,
)

User = get_user_model()


# ─── Category ────────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'image']


# ─── Shop ────────────────────────────────────────────────────
class ShopSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    product_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Shop
        fields = ['id', 'owner', 'owner_username', 'shop_name', 'logo', 'banner',
                  'description', 'status', 'created_at', 'product_count']
        read_only_fields = ['owner', 'status', 'created_at']

    def get_product_count(self, obj):
        return obj.products.filter(status='active').count()


class ShopCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Shop
        fields = ['id', 'shop_name', 'logo', 'banner', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class ShopUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Shop
        fields = ['shop_name', 'logo', 'banner', 'description']


# ─── Product ─────────────────────────────────────────────────
class ProductListSerializer(serializers.ModelSerializer):
    shop_name     = serializers.CharField(source='shop.shop_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    final_price   = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'price', 'discount', 'final_price', 'stock',
                  'image', 'shop_name', 'category_name', 'status']


class ProductDetailSerializer(serializers.ModelSerializer):
    shop           = ShopSerializer(read_only=True)
    category       = CategorySerializer(read_only=True)
    final_price    = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count   = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'shop', 'category', 'name', 'description', 'price',
                  'discount', 'final_price', 'stock', 'image', 'status',
                  'created_at', 'updated_at', 'average_rating', 'review_count']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None

    def get_review_count(self, obj):
        return obj.reviews.count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ['id', 'category', 'name', 'description', 'price',
                  'discount', 'stock', 'image', 'status']
        read_only_fields = ['id']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        user = self.context['request'].user
        if user.role == 'seller':
            try:
                shop = Shop.objects.get(owner=user)
                validated_data['shop'] = shop
            except Shop.DoesNotExist:
                raise serializers.ValidationError(
                    "You must create a shop before adding products."
                )
        return super().create(validated_data)


# ─── Cart ────────────────────────────────────────────────────
class CartItemSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal   = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price']

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        try:
            product = Product.objects.get(id=product_id, status='active')
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or not available.")
        validated_data['product'] = product
        validated_data['price']   = product.final_price
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    items      = CartItemSerializer(many=True, read_only=True)
    total      = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = ['id', 'customer', 'items', 'item_count', 'total', 'created_at']
        read_only_fields = ['customer', 'created_at']

    def get_total(self, obj):
        return sum(item.subtotal for item in obj.items.all())

    def get_item_count(self, obj):
        return obj.items.count()


# ─── Address ─────────────────────────────────────────────────
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Address
        fields = ['id', 'customer', 'full_name', 'phone', 'address', 'city',
                  'state', 'country', 'zip_code', 'is_default']
        read_only_fields = ['customer']

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        if validated_data.get('is_default'):
            Address.objects.filter(
                customer=validated_data['customer'], is_default=True
            ).update(is_default=False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('is_default'):
            Address.objects.filter(
                customer=instance.customer, is_default=True
            ).exclude(pk=instance.pk).update(is_default=False)
        return super().update(instance, validated_data)


# ─── Order ───────────────────────────────────────────────────
class OrderItemSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    shop_name     = serializers.CharField(source='shop.shop_name', read_only=True)
    subtotal      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image',
                  'shop', 'shop_name', 'quantity', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items          = OrderItemSerializer(many=True, read_only=True)
    customer_name  = serializers.CharField(source='customer.get_full_name', read_only=True)
    address_detail = AddressSerializer(source='address', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'customer', 'customer_name', 'address', 'address_detail',
                  'payment_method', 'payment_status', 'order_status', 'total_amount',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['customer', 'payment_status', 'order_status',
                            'total_amount', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Order
        fields = ['address', 'payment_method']

    def validate_address(self, value):
        if value.customer != self.context['request'].user:
            raise serializers.ValidationError("Invalid address.")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    SELLER_ALLOWED = ['confirmed', 'processing', 'shipped', 'delivered']
    ADMIN_ALLOWED  = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

    order_status = serializers.ChoiceField(choices=Order.ORDER_STATUS_CHOICES)

    def validate_order_status(self, value):
        user = self.context['request'].user
        if user.role == 'seller' and value not in self.SELLER_ALLOWED:
            raise serializers.ValidationError(
                f"Sellers can only set: {', '.join(self.SELLER_ALLOWED)}"
            )
        if user.role == 'admin' and value not in self.ADMIN_ALLOWED:
            raise serializers.ValidationError(
                f"Admins can set: {', '.join(self.ADMIN_ALLOWED)}"
            )
        return value


# ─── Dashboards ──────────────────────────────────────────────
class SellerDashboardSerializer(serializers.Serializer):
    total_products     = serializers.IntegerField()
    active_products    = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    total_orders       = serializers.IntegerField()
    pending_orders     = serializers.IntegerField()
    total_revenue      = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_revenue    = serializers.DecimalField(max_digits=12, decimal_places=2)


class AdminDashboardSerializer(serializers.Serializer):
    total_users      = serializers.IntegerField()
    total_sellers    = serializers.IntegerField()
    total_customers  = serializers.IntegerField()
    total_shops      = serializers.IntegerField()
    pending_shops    = serializers.IntegerField()
    total_products   = serializers.IntegerField()
    total_orders     = serializers.IntegerField()
    total_revenue    = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_revenue  = serializers.DecimalField(max_digits=12, decimal_places=2)


# ─── Review ──────────────────────────────────────────────────
class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)

    class Meta:
        model  = Review
        fields = ['id', 'customer', 'customer_name', 'product', 'rating',
                  'comment', 'is_flagged', 'created_at']
        read_only_fields = ['customer', 'is_flagged', 'created_at']

    def validate(self, attrs):
        product = attrs.get('product')
        if product and Review.objects.filter(
            customer=self.context['request'].user, product=product
        ).exists():
            raise serializers.ValidationError("You have already reviewed this product.")
        return attrs

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


# ─── Wishlist ────────────────────────────────────────────────
class WishlistSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        validated_data['product']  = product
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)
