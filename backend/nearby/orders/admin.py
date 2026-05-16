from django.contrib import admin
from .models import Order, OrderItem, Assignment, OrderNotification


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'assigned_to', 'created_at')
    list_filter = ('status',)
    search_fields = ('pickup_address', 'dropoff_address', 'user__email')
    inlines = [OrderItemInline]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'driver', 'assigned_at', 'accepted_at')


@admin.register(OrderNotification)
class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ('order', 'user', 'channel', 'sent_at')
