from django.db import models
from common_auth_user.models import AuthUser


class Rider(AuthUser):
    vehicle_type = models.CharField(max_length=50)
    license_number = models.CharField(max_length=100)
    neighbourhood = models.CharField(max_length=255, null=True, blank=True)
    rating = models.FloatField(default=0.0)

    class Meta:
        verbose_name = 'Rider'
        verbose_name_plural = 'Riders'

    def __str__(self):
        return f"{self.full_name} ({self.vehicle_type})"
