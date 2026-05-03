from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views


urlpatterns = [
    path('register/', views.register_rider, name='register_rider'),
    path('login/', TokenObtainPairView.as_view(), name='rider_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='rider_token_refresh'),
]
