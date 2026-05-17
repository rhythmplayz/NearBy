from django.contrib import admin
from .models import Order, OrderItem, Assignment, OrderNotification, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('status', 'changed_by', 'note', 'timestamp')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'assigned_to', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('pickup_address', 'dropoff_address', 'user__email')
    inlines = [OrderItemInline, OrderStatusHistoryInline]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'driver', 'assigned_at', 'accepted_at')


@admin.register(OrderNotification)
class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ('order', 'user', 'channel', 'sent_at')


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'changed_by', 'timestamp')
    list_filter = ('status',)
