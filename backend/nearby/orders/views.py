from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Order, Assignment
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('assigned_to')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        # allow regular users to see their own orders and riders to see orders assigned to them
        return Order.objects.filter(Q(user=user) | Q(assigned_to=user))

    def perform_create(self, serializer): # Removed user=self.request.user to avoid duplicate
        serializer.save()

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        status_value = request.data.get('status')
        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_value
        if status_value == Order.STATUS_CANCELLED:
            order.canceled_reason = request.data.get('canceled_reason', '')
        order.save()
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
