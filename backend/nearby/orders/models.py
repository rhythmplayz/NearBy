from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_ASSIGNED = 'assigned'
    STATUS_PICKED_UP = 'picked_up'
    STATUS_IN_TRANSIT = 'in_transit'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_PICKED_UP, 'Picked Up'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('online', 'Online Payment'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    seller = models.ForeignKey(
        'sellers.Seller', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='seller_orders',
        help_text='Seller whose products are in this order'
    )
    pickup_address = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_address = models.CharField(max_length=255)
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    items_description = models.TextField(blank=True)

    # Pricing breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.00, help_text='Tax percentage')
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    estimated_distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # Payment
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')

    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_orders')
    canceled_reason = models.TextField(null=True, blank=True)
    customer_note = models.TextField(blank=True, help_text='Special instructions from customer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_at']),
            models.Index(fields=['seller']),
        ]

    def __str__(self):
        return f"Order #{self.id} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(
        'products.Product', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='order_items',
        help_text='Reference to the product ordered'
    )
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} x{self.quantity} @ {self.unit_price}"


class OrderStatusHistory(models.Model):
    """Tracks status changes for order tracking with timestamps."""
    order = models.ForeignKey(Order, related_name='status_history', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='status_changes'
    )
    note = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['order', 'timestamp']),
        ]

    def __str__(self):
        return f"Order #{self.order_id} -> {self.status} at {self.timestamp}"


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


@receiver(post_save, sender=Order)
def create_status_notification(sender, instance, created, **kwargs):
    """Create a notification when order status changes."""
    from notifications.models import Notification, NotificationType

    status_messages = {
        Order.STATUS_PENDING: 'Your order has been placed and is pending.',
        Order.STATUS_CONFIRMED: 'Your order has been confirmed by the seller.',
        Order.STATUS_ASSIGNED: 'A rider has been assigned to your order.',
        Order.STATUS_PICKED_UP: 'Your order has been picked up.',
        Order.STATUS_IN_TRANSIT: 'Your order is on its way!',
        Order.STATUS_DELIVERED: 'Your order has been delivered successfully!',
        Order.STATUS_CANCELLED: 'Your order has been cancelled.',
    }

    message = status_messages.get(instance.status, f'Order #{instance.id} status updated to {instance.status}')

    if created:
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=instance,
            status=instance.status,
            note='Order created'
        )
    else:
        # Check if status actually changed by looking at history
        last_history = instance.status_history.order_by('-timestamp').first()
        if not last_history or last_history.status != instance.status:
            OrderStatusHistory.objects.create(
                order=instance,
                status=instance.status,
            )

    # Create notification for the order owner
    Notification.objects.create(
        recipient=instance.user,
        notification_type=NotificationType.ORDER_STATUS,
        title=f'Order #{instance.id} Update',
        message=message,
    )

    # Create notification for the assigned rider (if any)
    if getattr(instance, 'assigned_to', None):
        # We don't want to notify the rider about their own action if they are the ones who triggered it?
        # But we don't have request.user here. So let's just notify them about status changes.
        rider_message = f"Order #{instance.id} status is now {instance.status}."
        if instance.status == Order.STATUS_ASSIGNED:
            rider_message = f"You have been assigned to Order #{instance.id}."
        Notification.objects.create(
            recipient=instance.assigned_to,
            notification_type=NotificationType.ORDER_STATUS,
            title=f'Order #{instance.id} Assigned/Update',
            message=rider_message,
        )
