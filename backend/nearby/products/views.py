from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from sellers.models import Seller
from .models import Product
from .serializers import ProductSerializer


class SellerProductListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_seller(self, request):
        try:
            return Seller.objects.get(id=request.user.id)
        except Seller.DoesNotExist:
            return None

    def get(self, request):
        seller = self._get_seller(request)
        if not seller:
            return Response({'error': 'Only sellers can manage products.'}, status=status.HTTP_403_FORBIDDEN)

        products = Product.objects.filter(
            seller=seller,
            deleted_at__isnull=True,
        ).select_related('category').prefetch_related('images')

        paginator = Paginator(products, 10)
        page_number = request.query_params.get('page', 1)
        page = paginator.get_page(page_number)
        serializer = ProductSerializer(page.object_list, many=True, context={'request': request})

        return Response({
            'count': paginator.count,
            'next_page': page.next_page_number() if page.has_next() else None,
            'previous_page': page.previous_page_number() if page.has_previous() else None,
            'results': serializer.data,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        seller = self._get_seller(request)
        if not seller:
            return Response({'error': 'Only sellers can manage products.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'message': 'Product created successfully.',
                'data': ProductSerializer(product, context={'request': request}).data,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SellerProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_seller(self, request):
        try:
            return Seller.objects.get(id=request.user.id)
        except Seller.DoesNotExist:
            return None

    def _get_product(self, seller, pk):
        return get_object_or_404(Product.objects.select_related('category').prefetch_related('images'), pk=pk, seller=seller)

    def get(self, request, pk):
        seller = self._get_seller(request)
        if not seller:
            return Response({'error': 'Only sellers can manage products.'}, status=status.HTTP_403_FORBIDDEN)

        product = self._get_product(seller, pk)
        return Response(ProductSerializer(product, context={'request': request}).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        seller = self._get_seller(request)
        if not seller:
            return Response({'error': 'Only sellers can manage products.'}, status=status.HTTP_403_FORBIDDEN)

        product = self._get_product(seller, pk)
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'message': 'Product updated successfully.',
                'data': ProductSerializer(product, context={'request': request}).data,
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        seller = self._get_seller(request)
        if not seller:
            return Response({'error': 'Only sellers can manage products.'}, status=status.HTTP_403_FORBIDDEN)

        product = self._get_product(seller, pk)
        product.is_active = False
        product.deleted_at = timezone.now()
        product.save(update_fields=['is_active', 'deleted_at', 'updated_at'])
        return Response({'message': 'Product deleted successfully.'}, status=status.HTTP_200_OK)


class PublicProductListView(APIView):
    """
    Public endpoint for users to browse all active products from verified sellers.
    Supports search by name/description and filtering by category.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(
            is_active=True,
            deleted_at__isnull=True,
            seller__verification_status='verified',
        ).select_related('category', 'seller').prefetch_related('images').order_by('-created_at')

        # Search
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(seller__business_name__icontains=search)
            )

        # Filter by category
        category = request.query_params.get('category', '').strip()
        if category:
            products = products.filter(category__name__iexact=category)

        # Filter by seller
        seller_id = request.query_params.get('seller_id')
        if seller_id:
            products = products.filter(seller_id=seller_id)

        paginator = Paginator(products, 20)
        page_number = request.query_params.get('page', 1)
        page = paginator.get_page(page_number)
        serializer = ProductSerializer(page.object_list, many=True, context={'request': request})

        return Response({
            'count': paginator.count,
            'next_page': page.next_page_number() if page.has_next() else None,
            'previous_page': page.previous_page_number() if page.has_previous() else None,
            'results': serializer.data,
        }, status=status.HTTP_200_OK)


class PublicProductDetailView(APIView):
    """Public endpoint to get a single product's details."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.filter(
                is_active=True,
                deleted_at__isnull=True,
            ).select_related('category', 'seller').prefetch_related('images'),
            pk=pk
        )
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
