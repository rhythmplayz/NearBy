from django.db import models
from common_auth_user.models import AuthUser

class User(AuthUser):
    neighbourhood = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.full_name} - {self.neighbourhood}"