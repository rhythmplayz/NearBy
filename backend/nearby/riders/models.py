from django.db import models
from django.conf import settings
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


class RiderReport(models.Model):
    REPORT_TYPES = [
        ('complaint', 'Complaint'),
        ('feedback', 'Feedback'),
        ('incident', 'Incident'),
        ('inquiry', 'Inquiry'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rider_reports')
    report_type = models.CharField(max_length=32, choices=REPORT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(null=True, blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rider Report'
        verbose_name_plural = 'Rider Reports'

    def __str__(self):
        return f"{self.report_type} - {self.title} ({self.status})"


class RiderReportAttachment(models.Model):
    report = models.ForeignKey(RiderReport, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='rider_reports/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Rider Report Attachment'
        verbose_name_plural = 'Rider Report Attachments'

    def __str__(self):
        return f"Attachment {self.pk} for report {self.report_id}"
