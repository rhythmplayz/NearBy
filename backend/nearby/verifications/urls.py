from django.urls import path
from . import views

urlpatterns = [
    # --- Seller Endpoints ---
    path('submit/', views.submit_seller_verification, name='submit_seller_verification'),
    path('seller-verification/', views.submit_seller_verification, name='seller_verification'),

    # --- Admin Endpoints ---
    path('admin/verifications/', views.admin_list_verifications, name='admin_list_verifications'),
    path('admin/verifications/<int:pk>/review/', views.admin_review_verification, name='admin_review_verification'),
]