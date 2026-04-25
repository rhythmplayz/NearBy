from django.db import models
from common_auth_user.models import AuthUser


class Rider(AuthUser):
    vehicle_type = models.CharField(max_length=50)
    license_number = models.CharField(max_length=100)
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
        verbose_name = 'Rider'
        verbose_name_plural = 'Riders'

    def __str__(self):
        return f"{self.full_name} ({self.vehicle_type}) - {self.verification_status}"
