from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Shop(models.Model):
    """
    Shop model - one shop per seller.
    Status field enforces approval workflow per consistency review.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('suspended', 'Suspended'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shops')
    shop_name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='shops/banners/', blank=True, null=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shops'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.shop_name


class Category(models.Model):
    """Product categories managed by Super Admin."""
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Product model with shop foreign key for multi-vendor isolation.
    Status field allows admin moderation.
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    )
    
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['shop', 'status']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        """Calculate price after discount."""
        if self.discount > 0:
            return self.price - (self.price * self.discount / 100)
        return self.price


class Cart(models.Model):
    """Shopping cart for customers."""
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'carts'
    
    def __str__(self):
        return f"Cart of {self.customer.username}"


class CartItem(models.Model):
    """
    Individual items in cart.
    Price is captured at cart-add time to handle price changes.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product']
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.price * self.quantity


class Address(models.Model):
    """Customer shipping addresses."""
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'addresses'
        verbose_name_plural = 'Addresses'
    
    def __str__(self):
        return f"{self.full_name} - {self.city}"


class Order(models.Model):
    """
    Order header - one per customer checkout.
    OrderItems link to shops for multi-vendor isolation.
    """
    PAYMENT_METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    address = models.ForeignKey(Address, on_delete=models.PROTECT)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    order_status = models.CharField(max_length=15, choices=ORDER_STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'order_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Order #{self.id} by {self.customer.username}"


class OrderItem(models.Model):
    """
    CRITICAL: shop FK enables per-seller filtering.
    This is the key to multi-vendor isolation per the spec.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    shop = models.ForeignKey(Shop, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'order_items'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['shop']),  # Critical for seller filtering
        ]
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} from {self.shop.shop_name}"
    
    @property
    def subtotal(self):
        return self.price * self.quantity
    
    def save(self, *args, **kwargs):
        """Enforce OrderItem.shop matches OrderItem.product.shop per security checklist."""
        if self.product.shop != self.shop:
            raise ValueError("OrderItem.shop must match OrderItem.product.shop")
        super().save(*args, **kwargs)


class Review(models.Model):
    """
    Product reviews with moderation flag per consistency review.
    """
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_flagged = models.BooleanField(default=False)  # Added per consistency review
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['customer', 'product']  # One review per customer per product
    
    def __str__(self):
        return f"{self.customer.username} - {self.product.name} ({self.rating}★)"


class Wishlist(models.Model):
    """Customer wishlist."""
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'wishlists'
        unique_together = ['customer', 'product']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.username} - {self.product.name}"
