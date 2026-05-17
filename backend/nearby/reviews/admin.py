from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'user', 'rating', 'status', 'is_verified_purchase', 'created_at']
    list_filter = ['status', 'rating', 'is_verified_purchase']
    search_fields = ['product__name', 'user__username', 'title', 'comment']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
