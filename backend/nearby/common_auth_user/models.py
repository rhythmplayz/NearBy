from django.contrib.auth.models import AbstractUser
from django.db import models

class AuthUser(AbstractUser):
    # This is the "Base" for all 4 types
    # It contains common fields like email, password, and status
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'Regular User'),
        ('rider', 'Rider'),
        ('seller', 'Seller'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    profile_pic = models.ImageField(upload_to='profiles/', null=True, blank=True)
    status = models.CharField(max_length=10,choices=STATUS_CHOICES, default='active')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='created_auth_users')
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='updated_users')

    def __str__(self):
        return f"{self.username} ({self.user_type})"