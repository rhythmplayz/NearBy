from django.db import models
from common_auth_user.models import AuthUser
from django.db.models import JSONField
from django.conf import settings


class ReportDefinition(models.Model):
    REPORT_TYPES = [
        ('user_activity', 'User Activity'),
        ('transactions', 'Transactions'),
        ('orders', 'Orders'),
        ('inventory', 'Inventory'),
        ('seller_performance', 'Seller Performance'),
        ('rider_reports', 'Rider Reports'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    report_type = models.CharField(max_length=64, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    default_params = JSONField(default=dict, blank=True)
    schedule = models.CharField(max_length=100, blank=True, null=True, help_text='Cron or human schedule string')
    allow_custom_params = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Report Definition'
        verbose_name_plural = 'Report Definitions'

    def __str__(self):
        return self.name


class GeneratedReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    definition = models.ForeignKey(ReportDefinition, on_delete=models.SET_NULL, null=True, related_name='generated')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    params = JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    row_count = models.IntegerField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'

    def __str__(self):
        return f"{self.definition_id or 'custom'} - {self.pk} - {self.status}"


class ReportAccessLog(models.Model):
    ACTIONS = [
        ('generate', 'Generate'),
        ('download', 'Download'),
        ('view', 'View'),
    ]

    report = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='access_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ACTIONS)
    ip_address = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Report Access Log'
        verbose_name_plural = 'Report Access Logs'

    def __str__(self):
        return f"{self.report_id} - {self.action} by {self.user_id or 'anon'}"


class Admin(AuthUser):
    class Meta:
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'

    def __str__(self):
        return f"{self.full_name} (Admin)"
