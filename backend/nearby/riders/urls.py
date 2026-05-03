from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RiderTokenObtainPairView
from . import views


urlpatterns = [
    path('register/', views.register_rider, name='register_rider'),
    path('login/', RiderTokenObtainPairView.as_view(), name='rider_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='rider_token_refresh'),
    path('reports/', views.RiderSupportReportView.as_view(), name='rider_support_reports'),
    path('reports/<int:pk>/', views.RiderSupportReportDetailView.as_view(), name='rider_support_report_detail'),
    path('admin/reports/', views.AdminRiderReportListView.as_view(), name='admin_rider_reports'),
    path('admin/reports/analytics/', views.AdminRiderReportAnalyticsView.as_view(), name='admin_rider_reports_analytics'),
    path('admin/reports/<int:pk>/status/', views.AdminRiderReportStatusView.as_view(), name='admin_rider_report_status'),
    path('profile/', views.RiderProfileView.as_view(), name='rider_profile'),
]
