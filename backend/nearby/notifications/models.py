from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    INFO = 'INFO', 'Information'
    WARNING = 'WARNING', 'Warning'
    SUCCESS = 'SUCCESS', 'Success'
    ERROR = 'ERROR', 'Error'
    REMINDER = 'REMINDER', 'Reminder'
    SYSTEM = 'SYSTEM', 'System Announcement'
    ORDER_STATUS = 'ORDER_STATUS', 'Order Status'
    STOCK_ALERT = 'STOCK_ALERT', 'Stock Alert'
    EMERGENCY = 'EMERGENCY', 'Emergency'
    COMMUNITY_UPDATE = 'COMMUNITY_UPDATE', 'Community Update'

class NotificationPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'

class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.INFO)
    priority = models.CharField(max_length=10, choices=NotificationPriority.choices, default=NotificationPriority.LOW)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recipient.username} - {self.notification_type} - {self.title}"
