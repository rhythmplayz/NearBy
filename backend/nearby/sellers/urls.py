from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_seller, name='register_seller'),
    
    path('login/', views.SellerTokenObtainPairView.as_view(), name='seller_login'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.SellerProfileView.as_view(), name='seller_profile'),
]