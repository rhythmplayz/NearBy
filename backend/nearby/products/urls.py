from django.urls import path

from .views import SellerProductDetailView, SellerProductListCreateView

urlpatterns = [
    path('seller/', SellerProductListCreateView.as_view(), name='seller-products'),
    path('<int:pk>/', SellerProductDetailView.as_view(), name='product-detail'),
]
