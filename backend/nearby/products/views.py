from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg, Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from sellers.models import Seller
from .models import Product, ProductCategory
from .serializers import ProductSerializer, BuyerProductSerializer, ProductCategorySerializer


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
class BuyerProductListView(APIView):
    """
    Public product browsing API for buyers.
    Supports search, filter, sort, and pagination.
    """
    permission_classes = [AllowAny]

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
        ).select_related('category', 'seller').prefetch_related('images', 'reviews')

        # --- Search ---
        search = request.query_params.get('search', '').strip()
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(seller__business_name__icontains=search) |
                Q(category__name__icontains=search)
            )

        # --- Filter by category ---
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
        # --- Filter by price range ---
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                products = products.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                products = products.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        # --- Filter by minimum rating ---
        min_rating = request.query_params.get('min_rating')
        if min_rating:
            try:
                min_r = float(min_rating)
                products = products.annotate(
                    avg_rating=Avg('reviews__rating', filter=Q(reviews__status='approved'))
                ).filter(avg_rating__gte=min_r)
            except (ValueError, TypeError):
                pass

        # --- Filter by availability ---
        availability = request.query_params.get('availability', '').strip().lower()
        if availability == 'in_stock':
            products = products.filter(stock__gt=0)
        elif availability == 'out_of_stock':
            products = products.filter(stock=0)

        # --- Sorting ---
        sort = request.query_params.get('sort', 'newest').strip().lower()
        if sort == 'price_low':
            products = products.order_by('price')
        elif sort == 'price_high':
            products = products.order_by('-price')
        elif sort == 'popularity':
            products = products.annotate(
                review_count_val=Count('reviews', filter=Q(reviews__status='approved'))
            ).order_by('-review_count_val')
        elif sort == 'rating':
            products = products.annotate(
                avg_rating_sort=Avg('reviews__rating', filter=Q(reviews__status='approved'))
            ).order_by('-avg_rating_sort')
        else:  # newest (default)
            products = products.order_by('-created_at')

        # --- Pagination ---
        page_size = min(int(request.query_params.get('page_size', 12)), 50)
        paginator = Paginator(products, page_size)
        page_number = request.query_params.get('page', 1)
        page = paginator.get_page(page_number)

        serializer = BuyerProductSerializer(page.object_list, many=True, context={'request': request})

        return Response({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page.number,
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
class BuyerProductDetailView(APIView):
    """Public product detail view for buyers."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related('category', 'seller').prefetch_related('images', 'reviews'),
            pk=pk,
            is_active=True,
            deleted_at__isnull=True,
        )
        serializer = BuyerProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductCategoryListView(APIView):
    """List all product categories."""
    permission_classes = [AllowAny]

    def get(self, request):
        categories = ProductCategory.objects.annotate(
            product_count=Count('products', filter=Q(
                products__is_active=True,
                products__deleted_at__isnull=True,
            ))
        ).filter(product_count__gt=0).order_by('name')

        serializer = ProductCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
