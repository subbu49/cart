"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """MultiMart API — all endpoints."""
    return Response({
        'name': 'MultiMart API',
        'version': 'v1',
        'endpoints': {
            'auth': {
                'register':        '/api/v1/auth/register/',
                'login':           '/api/v1/auth/login/',
                'logout':          '/api/v1/auth/logout/',
                'token_refresh':   '/api/v1/auth/token/refresh/',
                'profile':         '/api/v1/auth/profile/',
                'change_password': '/api/v1/auth/change-password/',
            },
            'catalog': {
                'categories': '/api/v1/categories/',
                'shops':      '/api/v1/shops/',
                'products':   '/api/v1/products/',
            },
            'customer': {
                'cart':      '/api/v1/cart/',
                'addresses': '/api/v1/addresses/',
                'orders':    '/api/v1/orders/',
                'reviews':   '/api/v1/reviews/',
                'wishlist':  '/api/v1/wishlist/',
            },
            'order_actions': {
                'order_items':     '/api/v1/orders/{id}/items/',
                'update_status':   '/api/v1/orders/{id}/update_status/',
                'cancel_order':    '/api/v1/orders/{id}/cancel/',
            },
            'seller': {
                'dashboard':       '/api/v1/seller/dashboard/',
                'seller_orders':   '/api/v1/seller/dashboard/orders/',
            },
            'admin': {
                'dashboard':       '/api/v1/admin-dashboard/',
                'all_users':       '/api/v1/admin-dashboard/users/',
                'all_orders':      '/api/v1/admin-dashboard/orders/',
                'approve_shop':    '/api/v1/shops/{id}/approve/',
                'suspend_shop':    '/api/v1/shops/{id}/suspend/',
                'flag_review':     '/api/v1/reviews/{id}/flag/',
                'admin_panel':     '/admin/',
            },
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/', include('shop.urls')),
    path('', api_root),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
