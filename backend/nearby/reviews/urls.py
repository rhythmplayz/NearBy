from rest_framework import routers
from django.urls import path, include
from .views import ReviewViewSet

router = routers.DefaultRouter()
router.register(r'', ReviewViewSet, basename='reviews')

urlpatterns = [
    path('', include(router.urls)),
]
