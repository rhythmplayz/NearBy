from django.conf import settings
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


class RiderSupportReport(models.Model):
    REPORT_TYPE_CHOICES = (
        ('complaint', 'Complaint'),
        ('feedback', 'Feedback'),
        ('inquiry', 'Inquiry'),
        ('service_delay', 'Service Delay'),
        ('safety_concern', 'Safety Concern'),
        ('app_issue', 'App Issue'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    )

    rider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_reports',
    )
    report_type = models.CharField(max_length=40, choices=REPORT_TYPE_CHOICES)
    subject = models.CharField(max_length=150)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    attachment = models.FileField(upload_to='rider_reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Rider Support Report'
        verbose_name_plural = 'Rider Support Reports'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.get_report_type_display()} - {self.subject}"
