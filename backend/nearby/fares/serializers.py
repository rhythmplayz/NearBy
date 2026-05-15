from rest_framework import serializers
from .models import FareConfiguration, PromoCode, Trip, FareCalculation
from riders.models import Rider


class FareConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for fare configuration."""
    
    class Meta:
        model = FareConfiguration
        fields = [
            'id', 'ride_type', 'currency', 'base_fare', 'per_km_rate',
            'per_minute_rate', 'surge_multiplier', 'waiting_charge_per_minute',
            'free_waiting_minutes', 'minimum_fare', 'maximum_fare',
            'rounding_method', 'decimal_places', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PromoCodeSerializer(serializers.ModelSerializer):
    """Serializer for promo codes."""
    
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = PromoCode
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'applicable_ride_types', 'max_uses', 'max_uses_per_user',
            'valid_from', 'valid_until', 'minimum_fare_required',
            'maximum_discount', 'is_active', 'total_uses', 'is_valid',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['total_uses', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Check if promo code is currently valid."""
        from django.utils import timezone
        now = timezone.now()
        return (
            obj.is_active and
            obj.valid_from <= now <= obj.valid_until and
            (not obj.max_uses or obj.total_uses < obj.max_uses)
        )


class TripSerializer(serializers.ModelSerializer):
    """Serializer for trip details."""
    
    rider_name = serializers.CharField(source='rider.full_name', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    promo_code_str = serializers.CharField(source='promo_code.code', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'user', 'user_name', 'rider', 'rider_name',
            'pickup_latitude', 'pickup_longitude', 'pickup_address',
            'dropoff_latitude', 'dropoff_longitude', 'dropoff_address',
            'estimated_distance_km', 'actual_distance_km',
            'estimated_duration_minutes', 'actual_duration_minutes',
            'ride_type', 'status', 'promo_code', 'promo_code_str',
            'requested_at', 'started_at', 'completed_at',
            'waiting_minutes', 'notes'
        ]
        read_only_fields = [
            'requested_at', 'started_at', 'completed_at', 'user',
            'rider', 'status'
        ]


class FareCalculationBreakdownSerializer(serializers.Serializer):
    """Serializer for fare calculation breakdown."""
    
    base_fare = serializers.DecimalField(max_digits=10, decimal_places=2)
    distance_charge = serializers.DecimalField(max_digits=10, decimal_places=2)
    time_charge = serializers.DecimalField(max_digits=10, decimal_places=2)
    waiting_charge = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal_before_surge = serializers.DecimalField(max_digits=10, decimal_places=2)
    surge_multiplier = serializers.DecimalField(max_digits=5, decimal_places=2)
    subtotal_after_surge = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_promo = serializers.DecimalField(max_digits=10, decimal_places=2)
    promo_code = serializers.CharField(allow_null=True, required=False)
    total_discount = serializers.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    final_fare = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    distance_km = serializers.FloatField()
    duration_minutes = serializers.IntegerField()
    waiting_minutes = serializers.IntegerField()


class FareCalculationSerializer(serializers.ModelSerializer):
    """Serializer for stored fare calculations."""
    
    trip_details = TripSerializer(source='trip', read_only=True)
    
    class Meta:
        model = FareCalculation
        fields = [
            'id', 'trip', 'trip_details', 'fare_config', 'base_fare',
            'distance_charge', 'time_charge', 'waiting_charge',
            'surge_multiplier_applied', 'subtotal', 'discount_promo',
            'promo_code_applied', 'other_discounts', 'total_discount',
            'tax_amount', 'tax_rate', 'final_fare', 'currency',
            'calculated_at', 'calculation_method', 'notes'
        ]
        read_only_fields = [
            'calculated_at', 'trip'
        ]


class FareCalculationRequestSerializer(serializers.Serializer):
    """Serializer for fare calculation requests."""
    
    # Location data (either coordinates or distance)
    pickup_latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    pickup_longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    dropoff_latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    dropoff_longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    
    # Alternative: direct distance input
    distance_km = serializers.FloatField(required=False, allow_null=True)
    
    # Trip duration (required)
    duration_minutes = serializers.IntegerField(required=True)
    
    # Optional parameters
    waiting_minutes = serializers.IntegerField(default=0, required=False)
    ride_type = serializers.ChoiceField(
        choices=['economy', 'premium', 'shared', 'delivery'],
        default='economy'
    )
    promo_code = serializers.CharField(required=False, allow_blank=True)
    surge_multiplier = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True
    )
    tax_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, default='0.00', required=False
    )
    currency = serializers.CharField(default='USD', required=False)
    
    def validate(self, data):
        """Validate that location data is complete."""
        has_coordinates = all([
            data.get('pickup_latitude'),
            data.get('pickup_longitude'),
            data.get('dropoff_latitude'),
            data.get('dropoff_longitude'),
        ])
        has_distance = data.get('distance_km') is not None
        
        if not (has_coordinates or has_distance):
            raise serializers.ValidationError(
                "Either provide distance_km or all four coordinates "
                "(pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude)"
            )
        
        return data


class FareHistorySerializer(serializers.ModelSerializer):
    """Serializer for user fare history."""
    
    fare_breakdown = FareCalculationSerializer(source='fare_calculation', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'pickup_address', 'dropoff_address', 'ride_type',
            'actual_distance_km', 'actual_duration_minutes',
            'requested_at', 'completed_at', 'status', 'fare_breakdown'
        ]
