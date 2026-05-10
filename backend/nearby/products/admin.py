from django.contrib import admin

from .models import Product, ProductCategory, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'seller', 'category', 'price', 'stock', 'is_active', 'deleted_at', 'created_at']
    list_filter = ['is_active', 'category']
    search_fields = ['name', 'description', 'seller__business_name']
    inlines = [ProductImageInline]
