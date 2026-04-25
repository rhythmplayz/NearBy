from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AdminTokenObtainPairView


urlpatterns = [
    path('login/', AdminTokenObtainPairView.as_view(), name='admin_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='admin_token_refresh'),
]
