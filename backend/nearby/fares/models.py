from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class FareConfiguration(models.Model):
    """
    Stores configurable fare calculation parameters.
    Supports different ride types and currencies.
    """
    RIDE_TYPE_CHOICES = [
        ('economy', 'Economy'),
        ('premium', 'Premium'),
        ('shared', 'Shared'),
        ('delivery', 'Delivery'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('INR', 'Indian Rupee'),
        ('NGN', 'Nigerian Naira'),
    ]

    ride_type = models.CharField(
        max_length=20,
        choices=RIDE_TYPE_CHOICES,
        unique=True,
        help_text="Type of ride/service"
    )
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='USD',
        help_text="Currency for fare calculation"
    )
    
    # Base fare (charged regardless of distance/time)
    base_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Base fare charged for every trip"
    )
    
    # Distance-based charges
    per_km_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Rate charged per kilometer"
    )
    
    # Time-based charges
    per_minute_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.001'))],
        help_text="Rate charged per minute of trip"
    )
    
    # Surge pricing
    surge_multiplier = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('1.00'))],
        help_text="Surge multiplier (1.0 = no surge)"
    )
    
    # Waiting time charges
    waiting_charge_per_minute = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.50'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Charge per minute for waiting time (after initial wait time)"
    )
    
    # Free waiting time in minutes before charges apply
    free_waiting_minutes = models.IntegerField(
        default=5,
        validators=[MinValueValidator(0)],
        help_text="Minutes of free waiting time"
    )
    
    # Minimum fare
    minimum_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Minimum fare for any trip"
    )
    
    # Maximum fare (optional ceiling)
    maximum_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum fare cap (optional)"
    )
    
    # Rounding precision
    ROUNDING_CHOICES = [
        ('up', 'Round Up'),
        ('down', 'Round Down'),
        ('nearest', 'Round to Nearest'),
    ]
    
    rounding_method = models.CharField(
        max_length=10,
        choices=ROUNDING_CHOICES,
        default='nearest',
        help_text="How to round the final fare"
    )
    
    decimal_places = models.IntegerField(
        default=2,
        validators=[MinValueValidator(0), ],
        help_text="Number of decimal places for rounding"
    )
    
    # Status and metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this configuration is active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Fare Configuration'
        verbose_name_plural = 'Fare Configurations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_ride_type_display()} ({self.currency})"


class PromoCode(models.Model):
    """
    Stores promo codes and discount information.
    """
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Promo code string (e.g., SUMMER2024)"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the promo"
    )
    
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percentage'
    )
    
    # Discount value
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Discount value (% or fixed amount)"
    )
    
    # Applicable ride types
    applicable_ride_types = models.CharField(
        max_length=255,
        default='all',
        help_text="Comma-separated ride types or 'all'"
    )
    
    # Usage limits
    max_uses = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text="Maximum total uses"
    )
    
    max_uses_per_user = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Maximum uses per user"
    )
    
    # Validity period
    valid_from = models.DateTimeField(
        help_text="Promo code valid from"
    )
    valid_until = models.DateTimeField(
        help_text="Promo code valid until"
    )
    
    # Minimum fare requirement
    minimum_fare_required = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Minimum fare to apply promo"
    )
    
    # Discount cap
    maximum_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum discount amount (for percentage discounts)"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether promo is active"
    )
    
    # Tracking
    total_uses = models.IntegerField(
        default=0,
        help_text="Total number of times used"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Promo Code'
        verbose_name_plural = 'Promo Codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.get_discount_type_display()})"


class Trip(models.Model):
    """
    Stores information about individual trips/rides.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # User and Rider
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips',
        help_text="User who booked the trip"
    )
    
    rider = models.ForeignKey(
        'riders.Rider',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_trips',
        help_text="Rider assigned to the trip"
    )
    
    # Location details
    pickup_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Pickup location latitude"
    )
    pickup_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Pickup location longitude"
    )
    pickup_address = models.CharField(
        max_length=255,
        help_text="Pickup location address"
    )
    
    dropoff_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Dropoff location latitude"
    )
    dropoff_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Dropoff location longitude"
    )
    dropoff_address = models.CharField(
        max_length=255,
        help_text="Dropoff location address"
    )
    
    # Distance and time
    estimated_distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Estimated distance in kilometers"
    )
    
    actual_distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual distance traveled in kilometers"
    )
    
    estimated_duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        help_text="Estimated trip duration in minutes"
    )
    
    actual_duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        help_text="Actual trip duration in minutes"
    )
    
    # Ride details
    ride_type = models.CharField(
        max_length=20,
        choices=FareConfiguration.RIDE_TYPE_CHOICES,
        default='economy'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Promo code
    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trips'
    )
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Waiting time tracking
    waiting_minutes = models.IntegerField(
        default=0,
        help_text="Total waiting time in minutes"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        help_text="Any notes about the trip"
    )
    
    class Meta:
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Trip {self.id} - {self.pickup_address} to {self.dropoff_address}"


class FareCalculation(models.Model):
    """
    Stores detailed fare calculation breakdown for trips.
    Provides transparency and audit trail.
    """
    trip = models.OneToOneField(
        Trip,
        on_delete=models.CASCADE,
        related_name='fare_calculation',
        help_text="Associated trip"
    )
    
    # Configuration used
    fare_config = models.ForeignKey(
        FareConfiguration,
        on_delete=models.SET_NULL,
        null=True,
        help_text="Fare configuration used for calculation"
    )
    
    # Fare components (detailed breakdown)
    base_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Base fare component"
    )
    
    distance_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Charge based on distance"
    )
    
    time_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Charge based on time"
    )
    
    waiting_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Charge for waiting time"
    )
    
    surge_multiplier_applied = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        help_text="Surge multiplier applied"
    )
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Subtotal before discounts"
    )
    
    # Discounts
    discount_promo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Discount from promo code"
    )
    
    promo_code_applied = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Promo code applied"
    )
    
    other_discounts = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Other discounts applied"
    )
    
    total_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total discount amount"
    )
    
    # Taxes (if applicable)
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Tax amount"
    )
    
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Tax rate applied (%)"
    )
    
    # Final fare
    final_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Final fare after all calculations"
    )
    
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency of the fare"
    )
    
    # Calculation metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    calculation_method = models.CharField(
        max_length=100,
        default='standard',
        help_text="Method used for calculation"
    )
    
    # Notes for audit
    notes = models.TextField(
        blank=True,
        help_text="Notes about the fare calculation"
    )
    
    class Meta:
        verbose_name = 'Fare Calculation'
        verbose_name_plural = 'Fare Calculations'
        ordering = ['-calculated_at']
    
    def __str__(self):
        return f"Fare for Trip {self.trip_id}: {self.currency} {self.final_fare}"
