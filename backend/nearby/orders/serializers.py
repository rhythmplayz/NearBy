from rest_framework import serializers
from .models import Order, OrderItem, Assignment, OrderNotification


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'name', 'quantity', 'notes')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
            'items', 'items_description', 'total_price', 'estimated_distance_km',
            'estimated_duration_minutes', 'status', 'assigned_to', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = (
            'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
            'items', 'items_description', 'estimated_distance_km', 'estimated_duration_minutes'
        )

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and hasattr(request, 'user') else None
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(user=user, **validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ('id', 'order', 'driver', 'assigned_at', 'accepted_at', 'declined_at')


class OrderNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderNotification
        fields = ('id', 'order', 'user', 'message', 'channel', 'sent_at')
