from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem, Assignment, OrderNotification, OrderStatusHistory
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default='')
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 'name', 'quantity', 'unit_price', 'total_price', 'notes')
        read_only_fields = ('total_price',)

    def get_product_image(self, obj):
        if obj.product:
            first_image = obj.product.images.first()
            if first_image and first_image.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first_image.image.url)
                return first_image.image.url
        return None


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
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_name', 'seller', 'seller_name',
            'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
            'items', 'items_description',
            'subtotal', 'tax_rate', 'tax_amount', 'delivery_fee', 'total_price',
            'estimated_distance_km', 'estimated_duration_minutes',
            'status', 'payment_method', 'payment_status',
            'assigned_to', 'assigned_to_name',
            'canceled_reason', 'customer_note', 'status_history',
            'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'user_name', 'status', 'created_at', 'updated_at')

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None

    def get_seller_name(self, obj):
        if obj.seller:
            return obj.seller.business_name
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


class CartItemSerializer(serializers.Serializer):
    """Serializer for individual cart items sent from the frontend."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class PlaceOrderSerializer(serializers.Serializer):
    """
    Serializer for placing a marketplace order from the cart.
    Validates products, stock, and calculates pricing with tax and delivery fee.
    """
    items = CartItemSerializer(many=True, min_length=1)
    delivery_address = serializers.CharField(max_length=255)
    delivery_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=None)
    delivery_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=None)
    payment_method = serializers.ChoiceField(choices=['cod', 'online'], default='cod')
    customer_note = serializers.CharField(required=False, allow_blank=True, default='')

    TAX_RATE = Decimal('5.00')       # 5% tax
    DELIVERY_FEE = Decimal('50.00')  # Flat delivery fee

    def validate_items(self, items):
        """Validate each cart item: product exists, is active, and in stock."""
        product_ids = [item['product_id'] for item in items]
        products = Product.objects.filter(
            id__in=product_ids,
            is_active=True,
            deleted_at__isnull=True,
        ).select_related('seller', 'category')

        product_map = {p.id: p for p in products}

        errors = []
        for item in items:
            pid = item['product_id']
            product = product_map.get(pid)
            if not product:
                errors.append(f'Product with ID {pid} not found or is unavailable.')
                continue
            if product.stock < item['quantity']:
                errors.append(
                    f'"{product.name}" only has {product.stock} in stock, '
                    f'but you requested {item["quantity"]}.'
                )

        if errors:
            raise serializers.ValidationError(errors)

        # Attach product objects for use in create()
        for item in items:
            item['_product'] = product_map[item['product_id']]

        return items

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        items_data = validated_data['items']

        # Determine seller from first product (all from same seller ideally)
        first_product = items_data[0]['_product']
        seller = first_product.seller

        # Calculate pricing
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item in items_data:
            product = item['_product']
            quantity = item['quantity']
            unit_price = product.price
            line_total = unit_price * quantity
            subtotal += line_total

            order_items_to_create.append({
                'product': product,
                'name': product.name,
                'quantity': quantity,
                'unit_price': unit_price,
                'total_price': line_total,
                'notes': item.get('notes', ''),
            })

        tax_amount = (subtotal * self.TAX_RATE / Decimal('100')).quantize(Decimal('0.01'))
        delivery_fee = self.DELIVERY_FEE
        total_price = subtotal + tax_amount + delivery_fee

        # Build items description
        items_desc = ', '.join(
            f"{item['name']} x{item['quantity']}"
            for item in order_items_to_create
        )

        # Create the order
        order = Order.objects.create(
            user=user,
            seller=seller,
            pickup_address=seller.address if seller.address else 'Seller Location',
            dropoff_address=validated_data['delivery_address'],
            dropoff_latitude=validated_data.get('delivery_latitude'),
            dropoff_longitude=validated_data.get('delivery_longitude'),
            items_description=items_desc,
            subtotal=subtotal,
            tax_rate=self.TAX_RATE,
            tax_amount=tax_amount,
            delivery_fee=delivery_fee,
            total_price=total_price,
            payment_method=validated_data.get('payment_method', 'cod'),
            customer_note=validated_data.get('customer_note', ''),
            status=Order.STATUS_PENDING,
        )

        # Create order items and decrement stock
        for item_data in order_items_to_create:
            product = item_data.pop('product')
            OrderItem.objects.create(order=order, product=product, **item_data)
            # Decrement stock
            product.stock -= item_data['quantity']
            product.save(update_fields=['stock', 'updated_at'])

        return order


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ('id', 'order', 'driver', 'assigned_at', 'accepted_at', 'declined_at')


class OrderNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderNotification
        fields = ('id', 'order', 'user', 'message', 'channel', 'sent_at')
