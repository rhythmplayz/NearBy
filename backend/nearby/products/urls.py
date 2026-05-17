from django.urls import path

from .views import SellerProductDetailView, SellerProductListCreateView, PublicProductListView, PublicProductDetailView
from .views import (
    SellerProductDetailView, SellerProductListCreateView,
    BuyerProductListView, BuyerProductDetailView,
    ProductCategoryListView,
)

urlpatterns = [
    path('seller/', SellerProductListCreateView.as_view(), name='seller-products'),
    path('<int:pk>/', SellerProductDetailView.as_view(), name='product-detail'),
    # Public product browsing endpoints for marketplace users
    path('browse/', PublicProductListView.as_view(), name='public-products'),
    path('browse/<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
    # Buyer-facing endpoints
    path('browse/', BuyerProductListView.as_view(), name='buyer-products'),
    path('browse/<int:pk>/', BuyerProductDetailView.as_view(), name='buyer-product-detail'),
    path('categories/', ProductCategoryListView.as_view(), name='product-categories'),
]
