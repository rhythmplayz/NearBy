from django.db import models
from django.conf import settings

class Post(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('hidden', 'Hidden'),
        ('deleted', 'Deleted'),
    ]

    POST_TYPE_CHOICES = [
        ('general', 'General'),
        ('event', 'Event'),
        ('announcement', 'Announcement'),
    ]

    # Core Fields from ERD
    title = models.CharField(max_length=255)
    description = models.TextField()
    cover_pic = models.ImageField(upload_to='posts/covers/', null=True, blank=True)
    post_type = models.CharField(
        max_length=20, 
        choices=POST_TYPE_CHOICES, 
        default='general'
    )
    
    # User Association
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='community_posts'
    )

    # Status and Metadata
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_community_posts'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='updated_community_posts'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Community Post'
        verbose_name_plural = 'Community Posts'

    def __str__(self):
        return f"{self.title} by {self.author.username}"