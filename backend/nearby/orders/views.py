from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import Order, Assignment, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer, PlaceOrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('assigned_to', 'user', 'seller').prefetch_related('items', 'items__product', 'status_history')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['pickup_address', 'dropoff_address', 'items_description']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action == 'place_order':
            return PlaceOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().select_related('assigned_to', 'user', 'seller').prefetch_related('items', 'items__product', 'status_history')
        # allow regular users to see their own orders and riders to see orders assigned to them
        return Order.objects.filter(
            Q(user=user) | Q(assigned_to=user)
        ).select_related('assigned_to', 'user', 'seller').prefetch_related('items', 'items__product', 'status_history')

    def perform_create(self, serializer): # Removed user=self.request.user to avoid duplicate
        serializer.save()

    @action(detail=False, methods=['post'], url_path='place-order', permission_classes=[IsAuthenticated])
    def place_order(self, request):
        """
        Place a marketplace order from the cart.
        Expects: { items: [{product_id, quantity, notes?}], delivery_address, payment_method?, customer_note? }
        Validates stock, calculates pricing (subtotal + 5% tax + delivery fee), and creates the order atomically.
        """
        serializer = PlaceOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'message': 'Order placed successfully!',
                'order': OrderSerializer(order, context={'request': request}).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        status_value = request.data.get('status')
        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Permission check: only order owner, assigned rider, or admin can update
        if not request.user.is_staff and order.user != request.user and order.assigned_to != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        order.status = status_value
        if status_value == Order.STATUS_CANCELLED:
            order.canceled_reason = request.data.get('canceled_reason', '')
        order.save()
        
        # Record status history
        OrderStatusHistory.objects.create(
            order=order,
            status=status_value,
            changed_by=request.user,
            note=request.data.get('note', '')
        )
        
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        # assign to current user and mark assigned
        order.assigned_to = request.user
        order.status = Order.STATUS_ASSIGNED
        order.save()
        # create assignment record if not exists
        Assignment.objects.get_or_create(order=order, defaults={'driver': request.user})
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pickup(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        order.status = Order.STATUS_PICKED_UP
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start_transit(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        order.status = Order.STATUS_IN_TRANSIT
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        order.status = Order.STATUS_DELIVERED
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['get'], url_path='tracking')
    def tracking(self, request, pk=None):
        """Get order tracking details with status history timeline."""
        order = get_object_or_404(
            Order.objects.select_related('assigned_to', 'user', 'seller').prefetch_related('items', 'items__product', 'status_history'),
            pk=pk
        )
        # Check access
        if not request.user.is_staff and order.user != request.user and order.assigned_to != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrderSerializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-orders')
    def my_orders(self, request):
        """Get current user's orders."""
        orders = Order.objects.filter(user=request.user).select_related(
            'assigned_to', 'user', 'seller'
        ).prefetch_related('items', 'items__product', 'status_history').order_by('-created_at')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)

        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='admin-all', permission_classes=[IsAdminUser])
    def admin_all(self, request):
        """Admin endpoint to manage all orders."""
        orders = Order.objects.all().select_related(
            'assigned_to', 'user', 'seller'
        ).prefetch_related('items', 'items__product', 'status_history').order_by('-created_at')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)

        # Search
        search = request.query_params.get('search', '').strip()
        if search:
            orders = orders.filter(
                Q(pickup_address__icontains=search) |
                Q(dropoff_address__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__full_name__icontains=search)
            )

        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
