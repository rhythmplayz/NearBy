from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ReportDefinitionListCreateAPIView, GeneratedReportListAPIView, generate_report, download_report_file
from .views import AdminProfileView, AdminTokenObtainPairView, register_admin


urlpatterns = [
    path('login/', AdminTokenObtainPairView.as_view(), name='admin_login'),
    path('register/', register_admin, name='admin_register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='admin_token_refresh'),
    path('reports/definitions/', ReportDefinitionListCreateAPIView.as_view(), name='report_definitions'),
    path('reports/generated/', GeneratedReportListAPIView.as_view(), name='generated_reports'),
    path('reports/generate/', generate_report, name='generate_report'),
    path('reports/download/<int:pk>/', download_report_file, name='download_report'),
    path('profile/', AdminProfileView.as_view(), name='admin_profile'),
]
