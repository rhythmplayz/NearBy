from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product reviews.
    - List: Anyone can view approved reviews
    - Create: Only authenticated users
    - Update/Delete: Only the review author
    - Moderate: Admin only
    """
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'rating', 'status', 'is_verified_purchase']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'product_stats']:
            return [AllowAny()]
        if self.action in ['moderate']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Review.objects.select_related('user', 'product')

        # If not staff, only show approved reviews (or own reviews)
        if not user.is_authenticated or not user.is_staff:
            if user.is_authenticated:
                qs = qs.filter(
                    status=Review.STATUS_APPROVED
                ) | Review.objects.filter(user=user)
            else:
                qs = qs.filter(status=Review.STATUS_APPROVED)

        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only edit your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only edit your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only delete your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='product-stats/(?P<product_id>[^/.]+)')
    def product_stats(self, request, product_id=None):
        """Get average rating and review count for a product."""
        stats = Review.objects.filter(
            product_id=product_id,
            status=Review.STATUS_APPROVED
        ).aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
            five_star=Count('id', filter=models.Q(rating=5)),
            four_star=Count('id', filter=models.Q(rating=4)),
            three_star=Count('id', filter=models.Q(rating=3)),
            two_star=Count('id', filter=models.Q(rating=2)),
            one_star=Count('id', filter=models.Q(rating=1)),
        )
        stats['average_rating'] = round(stats['average_rating'] or 0, 1)
        return Response(stats)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def moderate(self, request, pk=None):
        """Admin can approve/reject reviews."""
        review = self.get_object()
        new_status = request.data.get('status')
        if new_status not in [Review.STATUS_APPROVED, Review.STATUS_REJECTED]:
            return Response(
                {'detail': 'Status must be approved or rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        review.status = new_status
        review.save()
        return Response(ReviewSerializer(review).data)

    @action(detail=False, methods=['get'], url_path='my-reviews')
    def my_reviews(self, request):
        """Get current user's reviews."""
        reviews = Review.objects.filter(user=request.user).select_related('product')
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


# Need to import models for Q
from django.db import models
