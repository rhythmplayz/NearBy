from rest_framework import serializers
from .models import Review
from orders.models import Order


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'username', 'user_full_name',
            'rating', 'title', 'comment', 'status',
            'is_verified_purchase', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'username', 'user_full_name',
                            'is_verified_purchase', 'status', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        product = attrs.get('product')

        # Check for duplicate review (only on create)
        if not self.instance and product and user:
            if Review.objects.filter(product=product, user=user).exists():
                raise serializers.ValidationError(
                    {'detail': 'You have already reviewed this product.'}
                )

        # Check if user has purchased this product (verified buyer check)
        if not self.instance and product and user:
            has_purchased = Order.objects.filter(
                user=user,
                status=Order.STATUS_DELIVERED,
                items_description__icontains=product.name
            ).exists()
            # Also set the flag in attrs for later use
            attrs['_has_purchased'] = has_purchased

        return attrs

    def create(self, validated_data):
        has_purchased = validated_data.pop('_has_purchased', False)
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['is_verified_purchase'] = has_purchased
        return super().create(validated_data)


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating reviews."""
    class Meta:
        model = Review
        fields = ['product', 'rating', 'title', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        product = attrs.get('product')

        if product and user:
            if Review.objects.filter(product=product, user=user).exists():
                raise serializers.ValidationError(
                    {'detail': 'You have already reviewed this product.'}
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        product = validated_data['product']

        # Check if verified buyer
        has_purchased = Order.objects.filter(
            user=user,
            status=Order.STATUS_DELIVERED,
            items_description__icontains=product.name
        ).exists()

        validated_data['user'] = user
        validated_data['is_verified_purchase'] = has_purchased
        return super().create(validated_data)
