from django.db import models
from django.conf import settings
from sellers.models import Seller 

class SellerVerification(models.Model):
    seller = models.OneToOneField(Seller, on_delete=models.CASCADE, related_name='verification_requests')
    
    id_proof = models.FileField(upload_to='verifications/ids/')
    business_license = models.FileField(upload_to='verifications/licenses/')
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    verification_status = models.CharField(max_length=10, choices=VERIFICATION_STATUS, default='pending')

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_verifications')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='updated_verifications')

    class Meta:
        verbose_name = 'Verification'
        verbose_name_plural = 'Verifications'

    def __str__(self):
        return f"Verification for {self.seller.business_name} - {self.verification_status}"