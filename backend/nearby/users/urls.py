from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    
    path('login/', TokenObtainPairView.as_view(), name='login'),

    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]