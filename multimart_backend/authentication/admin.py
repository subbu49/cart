from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'phone']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('MultiMart Info', {'fields': ('role', 'phone', 'profile_image')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('MultiMart Info', {'fields': ('role', 'phone', 'email', 'first_name', 'last_name')}),
    )
