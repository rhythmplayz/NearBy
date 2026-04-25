from django.db import models
from common_auth_user.models import AuthUser


class Admin(AuthUser):
    class Meta:
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'

    def __str__(self):
        return f"{self.full_name} (Admin)"
