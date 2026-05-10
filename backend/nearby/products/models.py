from django.db import models
from sellers.models import Seller


class ProductCategory(models.Model):
    name = models.CharField(max_length=120, unique=True, db_index=True)

    class Meta:
        verbose_name = 'Product Category'
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='products', db_index=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['seller', 'created_at']),
            models.Index(fields=['category', 'created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.seller.business_name}'

    @property
    def is_in_stock(self):
        return self.is_active and self.deleted_at is None and self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'Image for {self.product_id}'
