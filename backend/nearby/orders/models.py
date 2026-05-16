from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ASSIGNED = 'assigned'
    STATUS_PICKED_UP = 'picked_up'
    STATUS_IN_TRANSIT = 'in_transit'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_PICKED_UP, 'Picked Up'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    pickup_address = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_address = models.CharField(max_length=255)
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    items_description = models.TextField(blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_orders')
    canceled_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Order #{self.id} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.name} x{self.quantity}"


class Assignment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='assignment')
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    declined_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Assignment for Order #{self.order.id}"


class OrderNotification(models.Model):
    CHANNEL_PUSH = 'push'
    CHANNEL_EMAIL = 'email'
    CHANNEL_SMS = 'sms'

    CHANNEL_CHOICES = [
        (CHANNEL_PUSH, 'Push'),
        (CHANNEL_EMAIL, 'Email'),
        (CHANNEL_SMS, 'SMS'),
    ]

    order = models.ForeignKey(Order, related_name='notifications', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default=CHANNEL_PUSH)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for Order #{self.order.id} via {self.channel}"


# --- Signals: broadcast order updates to websocket groups on status change ---
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@receiver(post_save, sender=Order)
def broadcast_order_update(sender, instance, created, **kwargs):
    # When an order is created or updated, broadcast the serialized order to group
    channel_layer = get_channel_layer()
    # import serializer here to avoid circular import at module load
    from .serializers import OrderSerializer
    data = OrderSerializer(instance).data
    group_name = f'order_{instance.id}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'order.update',
            'data': data,
        }
    )
