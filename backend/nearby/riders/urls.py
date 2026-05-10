from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views


urlpatterns = [
    path('register/', views.register_rider, name='register_rider'),
    path('login/', TokenObtainPairView.as_view(), name='rider_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='rider_token_refresh'),
    # Rider profile
    path('profile/', views.RiderProfileRetrieveUpdateAPIView.as_view(), name='rider_profile'),
    # Rider reports
    path('reports/', views.RiderReportListCreateAPIView.as_view(), name='rider_reports'),
    path('reports/<int:pk>/', views.RiderReportDetailAPIView.as_view(), name='rider_report_detail'),
    path('reports/<int:report_pk>/attachments/', views.RiderReportAttachmentUploadAPIView.as_view(), name='rider_report_attachments'),
    # Admin endpoints
    path('admin/reports/', views.AdminRiderReportListAPIView.as_view(), name='admin_rider_reports'),
    path('admin/reports/export/', views.AdminRiderReportExportAPIView.as_view(), name='admin_rider_reports_export'),
    path('admin/reports/<int:pk>/status/', views.AdminRiderReportStatusUpdateAPIView.as_view(), name='admin_rider_report_status'),
]
