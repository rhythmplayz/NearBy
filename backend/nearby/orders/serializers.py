from rest_framework import serializers
from .models import Order, OrderItem, Assignment, OrderNotification, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'name', 'quantity', 'notes')


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='System')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ('id', 'status', 'status_display', 'changed_by', 'changed_by_name', 'note', 'timestamp')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_name', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
            'items', 'items_description', 'total_price', 'estimated_distance_km',
            'estimated_duration_minutes', 'status', 'assigned_to', 'assigned_to_name',
            'canceled_reason', 'status_history',
            'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'user_name', 'status', 'created_at', 'updated_at')

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None

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
