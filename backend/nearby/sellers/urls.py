from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_seller, name='register_seller'),
    
    path('login/', TokenObtainPairView.as_view(), name='seller_login'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]