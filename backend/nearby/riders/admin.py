from django.contrib import admin

from .models import Rider


@admin.register(Rider)
class RiderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "phone_number", "user", "created_at")
    search_fields = ("full_name", "phone_number", "user__username", "user__email")
