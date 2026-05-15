from django.contrib import admin
from .models import FareConfiguration, PromoCode, Trip, FareCalculation


@admin.register(FareConfiguration)
class FareConfigurationAdmin(admin.ModelAdmin):
    """Admin configuration for FareConfiguration model."""
    
    list_display = [
        'ride_type', 'currency', 'base_fare', 'per_km_rate',
        'per_minute_rate', 'surge_multiplier', 'is_active', 'created_at'
    ]
    list_filter = ['ride_type', 'currency', 'is_active', 'created_at']
    search_fields = ['ride_type', 'currency']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('ride_type', 'currency', 'is_active')
        }),
        ('Fare Components', {
            'fields': (
                'base_fare', 'per_km_rate', 'per_minute_rate',
                'waiting_charge_per_minute', 'free_waiting_minutes'
            ),
            'description': 'Configure the rates for different fare components'
        }),
        ('Surge Pricing', {
            'fields': ('surge_multiplier',),
            'description': 'Multiplier for surge pricing (1.0 = no surge)'
        }),
        ('Fare Limits', {
            'fields': ('minimum_fare', 'maximum_fare'),
            'description': 'Set minimum and maximum fare boundaries'
        }),
        ('Rounding Rules', {
            'fields': ('rounding_method', 'decimal_places'),
            'description': 'Configure how fares are rounded'
        }),
        ('Audit Trail', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    """Admin configuration for PromoCode model."""
    
    list_display = [
        'code', 'discount_type', 'discount_value', 'maximum_discount',
        'is_active', 'valid_from', 'valid_until', 'total_uses', 'created_at'
    ]
    list_filter = [
        'discount_type', 'is_active', 'valid_from', 'valid_until', 'created_at'
    ]
    search_fields = ['code', 'description']
    readonly_fields = ['total_uses', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Discount Configuration', {
            'fields': (
                'discount_type', 'discount_value', 'maximum_discount'
            ),
            'description': 'Set discount type and amount'
        }),
        ('Applicability', {
            'fields': ('applicable_ride_types', 'minimum_fare_required'),
            'description': 'Define which rides and minimum fares qualify'
        }),
        ('Usage Limits', {
            'fields': (
                'max_uses', 'max_uses_per_user', 'total_uses'
            ),
            'description': 'Control how many times the code can be used'
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until'),
            'description': 'Set the date range when promo is active'
        }),
        ('Audit Trail', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Admin configuration for Trip model."""
    
    list_display = [
        'id', 'user', 'rider', 'ride_type', 'status',
        'pickup_address', 'dropoff_address', 'requested_at', 'completed_at'
    ]
    list_filter = [
        'ride_type', 'status', 'requested_at', 'completed_at'
    ]
    search_fields = [
        'user__full_name', 'rider__full_name',
        'pickup_address', 'dropoff_address'
    ]
    readonly_fields = [
        'requested_at', 'started_at', 'completed_at', 'user', 'rider'
    ]
    
    fieldsets = (
        ('User & Rider Information', {
            'fields': ('user', 'rider')
        }),
        ('Pickup Location', {
            'fields': (
                'pickup_latitude', 'pickup_longitude', 'pickup_address'
            )
        }),
        ('Dropoff Location', {
            'fields': (
                'dropoff_latitude', 'dropoff_longitude', 'dropoff_address'
            )
        }),
        ('Distance & Time', {
            'fields': (
                'estimated_distance_km', 'actual_distance_km',
                'estimated_duration_minutes', 'actual_duration_minutes'
            )
        }),
        ('Trip Details', {
            'fields': (
                'ride_type', 'status', 'promo_code',
                'waiting_minutes', 'notes'
            )
        }),
        ('Timeline', {
            'fields': (
                'requested_at', 'started_at', 'completed_at'
            ),
            'classes': ('collapse',)
        }),
    )


@admin.register(FareCalculation)
class FareCalculationAdmin(admin.ModelAdmin):
    """Admin configuration for FareCalculation model."""
    
    list_display = [
        'id', 'trip', 'final_fare', 'currency', 'subtotal',
        'total_discount', 'tax_amount', 'surge_multiplier_applied',
        'calculated_at'
    ]
    list_filter = [
        'currency', 'calculated_at', 'surge_multiplier_applied'
    ]
    search_fields = [
        'trip__pickup_address', 'trip__dropoff_address',
        'trip__user__full_name'
    ]
    readonly_fields = [
        'calculated_at', 'trip', 'base_fare', 'distance_charge',
        'time_charge', 'waiting_charge', 'subtotal'
    ]
    
    fieldsets = (
        ('Trip & Configuration', {
            'fields': ('trip', 'fare_config')
        }),
        ('Fare Components Breakdown', {
            'fields': (
                'base_fare', 'distance_charge', 'time_charge',
                'waiting_charge', 'surge_multiplier_applied'
            ),
            'description': 'Detailed breakdown of fare components'
        }),
        ('Subtotal', {
            'fields': ('subtotal',),
        }),
        ('Discounts', {
            'fields': (
                'discount_promo', 'promo_code_applied',
                'other_discounts', 'total_discount'
            ),
            'description': 'All discount information'
        }),
        ('Taxes', {
            'fields': ('tax_rate', 'tax_amount'),
        }),
        ('Final Fare', {
            'fields': ('final_fare', 'currency'),
            'classes': ('wide',)
        }),
        ('Metadata', {
            'fields': (
                'calculated_at', 'calculation_method', 'notes'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def has_delete_permission(self, request):
        """Prevent deletion of fare calculations."""
        return False
