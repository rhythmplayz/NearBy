from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AdminTokenObtainPairView, register_admin, AdminProfileView


urlpatterns = [
    path('login/', AdminTokenObtainPairView.as_view(), name='admin_login'),
    path('register/', register_admin, name='admin_register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='admin_token_refresh'),
    path('profile/', AdminProfileView.as_view(), name='admin_profile'),
]
