"""
Views for MultiMart — all phases.
Role-based queryset filtering and shop-ownership checks happen here,
at the ORM level, per the security spec (Section 11).
"""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from authentication.permissions import (
    IsAdmin, IsSeller, IsCustomer, IsSellerOrAdmin, IsShopOwnerOrAdmin,
)
from .models import (
    Shop, Category, Product, Cart, CartItem,
    Address, Order, OrderItem, Review, Wishlist,
)
from .serializers import (
    CategorySerializer,
    ShopSerializer, ShopCreateSerializer, ShopUpdateSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    CartSerializer, CartItemSerializer,
    AddressSerializer,
    OrderSerializer, OrderCreateSerializer, OrderItemSerializer,
    OrderStatusUpdateSerializer,
    SellerDashboardSerializer, AdminDashboardSerializer,
    ReviewSerializer,
    WishlistSerializer,
)


# ─────────────────────────────────────────────────────────────
# CATEGORY
# ─────────────────────────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write."""
    queryset       = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['name']
    ordering_fields  = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdmin()]


# ─────────────────────────────────────────────────────────────
# SHOP
# ─────────────────────────────────────────────────────────────
class ShopViewSet(viewsets.ModelViewSet):
    """
    Public  → approved shops only.
    Seller  → their own shop only.
    Admin   → everything + approve/suspend actions.
    """
    queryset       = Shop.objects.all()
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['shop_name', 'description']
    ordering_fields  = ['created_at', 'shop_name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [IsSeller()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsShopOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs   = Shop.objects.all()
        if not user.is_authenticated or user.role == 'customer':
            return qs.filter(status='approved')
        if user.role == 'seller':
            return qs.filter(owner=user)
        return qs  # admin

    def get_serializer_class(self):
        if self.action == 'create':
            return ShopCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ShopUpdateSerializer
        return ShopSerializer

    def perform_create(self, serializer):
        if Shop.objects.filter(owner=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a shop.")
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        shop = self.get_object()
        shop.status = 'approved'
        shop.save()
        return Response({'status': 'Shop approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def suspend(self, request, pk=None):
        shop = self.get_object()
        shop.status = 'suspended'
        shop.save()
        return Response({'status': 'Shop suspended'})


# ─────────────────────────────────────────────────────────────
# PRODUCT
# ─────────────────────────────────────────────────────────────
class ProductViewSet(viewsets.ModelViewSet):
    """
    Public  → active products from approved shops only.
    Seller  → only products belonging to their shop (IDOR guard).
    Admin   → everything.
    """
    queryset       = Product.objects.select_related('shop', 'category')
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['name', 'description', 'shop__shop_name']
    ordering_fields  = ['created_at', 'price', 'name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [IsSeller()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsShopOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs   = Product.objects.select_related('shop', 'category')
        user = self.request.user

        # Query-param filters (apply to all roles)
        if cat := self.request.query_params.get('category'):
            qs = qs.filter(category_id=cat)
        if shop := self.request.query_params.get('shop'):
            qs = qs.filter(shop_id=shop)
        if mn := self.request.query_params.get('min_price'):
            qs = qs.filter(price__gte=mn)
        if mx := self.request.query_params.get('max_price'):
            qs = qs.filter(price__lte=mx)

        if not user.is_authenticated or user.role == 'customer':
            return qs.filter(status='active', shop__status='approved')
        if user.role == 'seller':
            try:
                shop = Shop.objects.get(owner=user)
                return qs.filter(shop=shop)
            except Shop.DoesNotExist:
                return qs.none()
        return qs  # admin

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError, PermissionDenied
        try:
            shop = Shop.objects.get(owner=self.request.user)
        except Shop.DoesNotExist:
            raise ValidationError("You must create a shop first.")
        if shop.status != 'approved':
            raise PermissionDenied("Your shop must be approved before adding products.")
        serializer.save(shop=shop)


# ─────────────────────────────────────────────────────────────
# CART
# ─────────────────────────────────────────────────────────────
class CartViewSet(viewsets.ViewSet):
    """Customer cart — add / update / remove / clear."""
    permission_classes = [IsCustomer]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(customer=user)
        return cart

    def list(self, request):
        cart = self._get_cart(request.user)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart      = self._get_cart(request.user)
        serializer = CartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        product_id = request.data.get('product_id')

        existing = CartItem.objects.filter(cart=cart, product_id=product_id).first()
        if existing:
            existing.quantity += serializer.validated_data.get('quantity', 1)
            existing.save()
            return Response(CartItemSerializer(existing).data)

        serializer.save(cart=cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'],
            url_path='update_item/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        try:
            item = CartItem.objects.get(id=item_id, cart__customer=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        qty = request.data.get('quantity')
        if not qty or int(qty) < 1:
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = int(qty)
        item.save()
        return Response(CartItemSerializer(item).data)

    @action(detail=False, methods=['delete'],
            url_path='remove_item/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        try:
            item = CartItem.objects.get(id=item_id, cart__customer=request.user)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self._get_cart(request.user).items.all().delete()
        return Response({'status': 'Cart cleared'})


# ─────────────────────────────────────────────────────────────
# ADDRESS
# ─────────────────────────────────────────────────────────────
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class   = AddressSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Address.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


# ─────────────────────────────────────────────────────────────
# ORDER  (Phase 3 core)
# ─────────────────────────────────────────────────────────────
class OrderViewSet(viewsets.ModelViewSet):
    """
    POST /orders/            → customer checkout  (cart → order + OrderItem split)
    GET  /orders/            → role-filtered list
    GET  /orders/{id}/       → role-filtered detail
    GET  /orders/{id}/items/ → role-filtered items (CRITICAL seller isolation)
    POST /orders/{id}/update_status/ → seller/admin status update
    POST /orders/{id}/cancel/        → customer cancellation
    """
    http_method_names = ['get', 'post', 'head', 'options']  # no PUT/PATCH/DELETE on orders

    def get_permissions(self):
        if self.action == 'create':
            return [IsCustomer()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs   = Order.objects.prefetch_related('items__product', 'items__shop')

        if user.role == 'customer':
            return qs.filter(customer=user)

        if user.role == 'seller':
            try:
                shop = Shop.objects.get(owner=user)
                return qs.filter(items__shop=shop).distinct()
            except Shop.DoesNotExist:
                return qs.none()

        return qs  # admin — all orders

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    # ── CHECKOUT ──────────────────────────────────────────────
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Convert cart → Order + OrderItems.
        - Validates stock for every item before touching the DB.
        - Decrements stock atomically.
        - Clears cart on success.
        """
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        # 1. Get cart
        try:
            cart = Cart.objects.select_related('customer').prefetch_related(
                'items__product__shop'
            ).get(customer=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = list(cart.items.all())
        if not cart_items:
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Stock validation — fail fast before any writes
        errors = []
        for item in cart_items:
            product = item.product
            if product.status != 'active':
                errors.append(f"'{product.name}' is no longer available.")
            elif product.shop.status != 'approved':
                errors.append(f"Shop for '{product.name}' is not active.")
            elif product.stock < item.quantity:
                errors.append(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock}, requested: {item.quantity}."
                )
        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Create Order header
        total_amount = sum(item.subtotal for item in cart_items)
        order = Order.objects.create(
            customer       = request.user,
            address        = serializer.validated_data['address'],
            payment_method = serializer.validated_data['payment_method'],
            total_amount   = total_amount,
            order_status   = 'pending',
            payment_status = 'pending',
        )

        # 4. Create OrderItems + decrement stock
        for item in cart_items:
            product = item.product
            OrderItem.objects.create(
                order    = order,
                product  = product,
                shop     = product.shop,   # CRITICAL: shop FK for isolation
                quantity = item.quantity,
                price    = item.price,
            )
            # Atomic stock decrement
            Product.objects.filter(pk=product.pk).update(
                stock=product.stock - item.quantity
            )

        # 5. Clear cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    # ── ORDER ITEMS (role-filtered) ────────────────────────────
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """
        Customer → all items in their order.
        Seller   → ONLY items from their shop (IDOR guard).
        Admin    → all items.
        """
        order = self.get_object()
        user  = request.user

        if user.role == 'customer':
            if order.customer != user:
                return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
            qs = order.items.all()

        elif user.role == 'seller':
            try:
                shop = Shop.objects.get(owner=user)
            except Shop.DoesNotExist:
                return Response([], status=status.HTTP_200_OK)
            qs = order.items.filter(shop=shop)

        else:  # admin
            qs = order.items.all()

        return Response(OrderItemSerializer(qs, many=True).data)

    # ── STATUS UPDATE ──────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='update_status')
    def update_status(self, request, pk=None):
        """
        Seller can update: confirmed → processing → shipped → delivered.
        Admin  can update: any valid status including cancelled.
        Only affects orders that contain this seller's items.
        """
        order      = self.get_object()
        user       = request.user
        serializer = OrderStatusUpdateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['order_status']

        # Sellers can only update orders containing their items
        if user.role == 'seller':
            try:
                shop = Shop.objects.get(owner=user)
            except Shop.DoesNotExist:
                return Response({'error': 'No shop found.'}, status=status.HTTP_403_FORBIDDEN)
            if not order.items.filter(shop=shop).exists():
                return Response(
                    {'error': 'You can only update orders containing your products.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        order.order_status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

    # ── CANCEL ORDER ───────────────────────────────────────────
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Customer can cancel only their own pending/confirmed orders.
        Stock is restored on cancellation.
        """
        order = self.get_object()
        user  = request.user

        if user.role == 'customer' and order.customer != user:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.order_status not in ['pending', 'confirmed']:
            return Response(
                {'error': f"Cannot cancel an order with status '{order.order_status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Restore stock
            for item in order.items.all():
                Product.objects.filter(pk=item.product_id).update(
                    stock=item.product.stock + item.quantity
                )
            order.order_status   = 'cancelled'
            order.payment_status = 'refunded' if order.payment_status == 'paid' else order.payment_status
            order.save()

        return Response(OrderSerializer(order).data)


# ─────────────────────────────────────────────────────────────
# SELLER DASHBOARD  (Phase 4 / Analytics)
# ─────────────────────────────────────────────────────────────
class SellerDashboardView(viewsets.ViewSet):
    """
    GET /seller/dashboard/ → stats for the logged-in seller.
    GET /seller/orders/    → all orders containing this seller's items.
    """
    permission_classes = [IsSeller]

    def list(self, request):
        try:
            shop = Shop.objects.get(owner=request.user)
        except Shop.DoesNotExist:
            return Response({'error': 'No shop found.'}, status=status.HTTP_404_NOT_FOUND)

        now    = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        products     = Product.objects.filter(shop=shop)
        order_items  = OrderItem.objects.filter(shop=shop).select_related('order')

        total_revenue   = order_items.aggregate(
            rev=Sum('price') if False else Sum(
                # price * quantity — Django ORM expression
                __import__('django.db.models', fromlist=['F', 'ExpressionWrapper', 'DecimalField'])
                .ExpressionWrapper(
                    __import__('django.db.models', fromlist=['F']).F('price') *
                    __import__('django.db.models', fromlist=['F']).F('quantity'),
                    output_field=__import__('django.db.models', fromlist=['DecimalField']).DecimalField()
                )
            )
        )['rev'] or Decimal('0.00')

        # Simpler approach using Python aggregation
        total_revenue  = sum(i.subtotal for i in order_items)
        monthly_items  = order_items.filter(order__created_at__gte=month_start)
        monthly_revenue = sum(i.subtotal for i in monthly_items)

        data = {
            'total_products':     products.count(),
            'active_products':    products.filter(status='active').count(),
            'low_stock_products': products.filter(stock__lte=5, status='active').count(),
            'total_orders':       order_items.values('order').distinct().count(),
            'pending_orders':     order_items.filter(
                order__order_status='pending'
            ).values('order').distinct().count(),
            'total_revenue':      total_revenue,
            'monthly_revenue':    monthly_revenue,
        }
        return Response(SellerDashboardSerializer(data).data)

    @action(detail=False, methods=['get'])
    def orders(self, request):
        """Orders containing this seller's items — with role-filtered items."""
        try:
            shop = Shop.objects.get(owner=request.user)
        except Shop.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        orders = Order.objects.filter(
            items__shop=shop
        ).distinct().prefetch_related('items')

        # For each order, return only this seller's items
        result = []
        for order in orders:
            order_data              = OrderSerializer(order).data
            seller_items            = order.items.filter(shop=shop)
            order_data['items']     = OrderItemSerializer(seller_items, many=True).data
            order_data['my_total']  = str(sum(i.subtotal for i in seller_items))
            result.append(order_data)

        return Response(result)


# ─────────────────────────────────────────────────────────────
# ADMIN DASHBOARD  (Phase 4)
# ─────────────────────────────────────────────────────────────
class AdminDashboardView(viewsets.ViewSet):
    """
    GET /admin-dashboard/        → platform-wide stats.
    GET /admin-dashboard/users/  → all users with role filter.
    GET /admin-dashboard/orders/ → all orders.
    """
    permission_classes = [IsAdmin]

    def list(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        all_order_items   = OrderItem.objects.all()
        total_revenue     = sum(i.subtotal for i in all_order_items)
        monthly_items     = all_order_items.filter(order__created_at__gte=month_start)
        monthly_revenue   = sum(i.subtotal for i in monthly_items)

        data = {
            'total_users':     User.objects.count(),
            'total_sellers':   User.objects.filter(role='seller').count(),
            'total_customers': User.objects.filter(role='customer').count(),
            'total_shops':     Shop.objects.count(),
            'pending_shops':   Shop.objects.filter(status='pending').count(),
            'total_products':  Product.objects.count(),
            'total_orders':    Order.objects.count(),
            'total_revenue':   total_revenue,
            'monthly_revenue': monthly_revenue,
        }
        return Response(AdminDashboardSerializer(data).data)

    @action(detail=False, methods=['get'])
    def users(self, request):
        from django.contrib.auth import get_user_model
        from authentication.serializers import UserSerializer
        User  = get_user_model()
        role  = request.query_params.get('role')
        users = User.objects.all()
        if role:
            users = users.filter(role=role)
        return Response(UserSerializer(users, many=True).data)

    @action(detail=False, methods=['get'])
    def orders(self, request):
        orders = Order.objects.all().prefetch_related('items')
        return Response(OrderSerializer(orders, many=True).data)


# ─────────────────────────────────────────────────────────────
# REVIEW
# ─────────────────────────────────────────────────────────────
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [IsCustomer()]
        if self.action in ['flag', 'unflag']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Review.objects.select_related('customer', 'product')
        if pid := self.request.query_params.get('product'):
            qs = qs.filter(product_id=pid)
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return qs
        return qs.filter(is_flagged=False)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def flag(self, request, pk=None):
        review = self.get_object()
        review.is_flagged = True
        review.save()
        return Response({'status': 'Review flagged'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def unflag(self, request, pk=None):
        review = self.get_object()
        review.is_flagged = False
        review.save()
        return Response({'status': 'Review unflagged'})

    def perform_destroy(self, instance):
        # Only the review author or admin can delete
        user = self.request.user
        if user.role != 'admin' and instance.customer != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot delete this review.")
        instance.delete()


# ─────────────────────────────────────────────────────────────
# WISHLIST
# ─────────────────────────────────────────────────────────────
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class   = WishlistSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Wishlist.objects.filter(
            customer=self.request.user
        ).select_related('product')
