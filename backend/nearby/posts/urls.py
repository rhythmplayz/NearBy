from django.urls import path
from . import views

urlpatterns = [
    # --- Community Post Endpoints ---
    # GET to list, POST to create
    path('', views.list_create_posts, name='list_create_posts'),
    
    # GET detail, PUT/PATCH update, DELETE remove
    path('<int:pk>/', views.post_detail, name='post_detail'),
    
    # Explicit "create" endpoint if you prefer separate paths
    path('create/', views.list_create_posts, name='create_post'),
]