"""
Role-based permission classes for MultiMart.
These enforce the access control matrix from Section 4 of the spec.
"""
from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """Allow access only to users with customer role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'customer'


class IsSeller(permissions.BasePermission):
    """Allow access only to users with seller role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'seller'


class IsAdmin(permissions.BasePermission):
    """Allow access only to users with admin role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsSellerOrAdmin(permissions.BasePermission):
    """Allow access to sellers and admins."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['seller', 'admin']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission - allow owners to edit their own objects,
    or admins to edit any object.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.role == 'admin':
            return True
        
        # Check if object has an 'owner' attribute
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        # Check if object has a 'customer' attribute (for orders, reviews, etc.)
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        
        return False


class IsShopOwnerOrAdmin(permissions.BasePermission):
    """
    Critical permission for multi-vendor isolation.
    Ensures sellers can only access resources belonging to their shop.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admins can access everything
        if request.user.role == 'admin':
            return True
        
        # For sellers, check shop ownership
        if request.user.role == 'seller':
            # Direct shop access
            if hasattr(obj, 'owner'):
                return obj.owner == request.user
            
            # Product access - check product.shop.owner
            if hasattr(obj, 'shop'):
                return obj.shop.owner == request.user
            
            # OrderItem access - check orderitem.shop.owner
            if hasattr(obj, 'shop'):
                return obj.shop.owner == request.user
        
        return False
