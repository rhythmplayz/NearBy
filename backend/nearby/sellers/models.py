from django.db import models
from common_auth_user.models import AuthUser

class Seller(AuthUser):
    business_name = models.CharField(max_length=255)
    neighbourhood = models.CharField(max_length=255, null=True, blank=True)
    
    VERIFICATION_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_CHOICES, 
        default='pending'
    )
    rating = models.FloatField(default=0.0)

    class Meta:
        verbose_name = 'Seller'
        verbose_name_plural = 'Sellers'

    def __str__(self):
        return f"{self.business_name} ({self.full_name}) - {self.verification_status}"