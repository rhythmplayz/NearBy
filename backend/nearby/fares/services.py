import math
from decimal import Decimal, ROUND_HALF_UP, ROUND_UP, ROUND_DOWN
from datetime import datetime
from django.utils import timezone
from .models import FareConfiguration, FareCalculation, PromoCode


class FareCalculationService:
    """
    Service class for calculating fares based on various factors.
    Handles distance, time, surge pricing, discounts, and rounding.
    """
    
    def __init__(self, ride_type='economy', currency='USD'):
        """
        Initialize the service with ride type and currency.
        
        Args:
            ride_type (str): Type of ride ('economy', 'premium', 'shared', 'delivery')
            currency (str): Currency code (default: 'USD')
        """
        self.ride_type = ride_type
        self.currency = currency
        
        try:
            self.config = FareConfiguration.objects.get(
                ride_type=ride_type,
                currency=currency,
                is_active=True
            )
        except FareConfiguration.DoesNotExist:
            raise ValueError(
                f"No active fare configuration for {ride_type} in {currency}"
            )
    
    def calculate_distance_km(self, lat1, lon1, lat2, lon2):
        """
        Calculate distance between two points using Haversine formula.
        
        Args:
            lat1, lon1: Starting coordinates
            lat2, lon2: Ending coordinates
            
        Returns:
            float: Distance in kilometers
        """
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2)
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def calculate_distance_charge(self, distance_km):
        """
        Calculate charge based on distance.
        
        Args:
            distance_km (float): Distance in kilometers
            
        Returns:
            Decimal: Distance charge
        """
        if distance_km < 0:
            raise ValueError("Distance cannot be negative")
        
        return Decimal(str(distance_km)) * self.config.per_km_rate
    
    def calculate_time_charge(self, duration_minutes):
        """
        Calculate charge based on trip duration.
        
        Args:
            duration_minutes (int): Trip duration in minutes
            
        Returns:
            Decimal: Time charge
        """
        if duration_minutes < 0:
            raise ValueError("Duration cannot be negative")
        
        return Decimal(str(duration_minutes)) * self.config.per_minute_rate
    
    def calculate_waiting_charge(self, waiting_minutes):
        """
        Calculate charge for waiting time (after free waiting period).
        
        Args:
            waiting_minutes (int): Total waiting time in minutes
            
        Returns:
            Decimal: Waiting charge
        """
        if waiting_minutes < 0:
            raise ValueError("Waiting time cannot be negative")
        
        # Deduct free waiting minutes
        chargeable_minutes = max(0, waiting_minutes - self.config.free_waiting_minutes)
        
        return Decimal(str(chargeable_minutes)) * self.config.waiting_charge_per_minute
    
    def apply_surge_pricing(self, base_charge, surge_multiplier=None):
        """
        Apply surge pricing multiplier to the base charge.
        
        Args:
            base_charge (Decimal): Base charge before surge
            surge_multiplier (Decimal): Surge multiplier (default: config value)
            
        Returns:
            tuple: (surged_charge, multiplier_used)
        """
        multiplier = surge_multiplier or self.config.surge_multiplier
        
        if multiplier < Decimal('1.00'):
            raise ValueError("Surge multiplier cannot be less than 1.00")
        
        surged_charge = base_charge * multiplier
        return surged_charge, multiplier
    
    def validate_promo_code(self, promo_code_str, user_id=None, subtotal=None):
        """
        Validate a promo code for the current transaction.
        
        Args:
            promo_code_str (str): Promo code string
            user_id (int): User ID for checking per-user limits
            subtotal (Decimal): Current subtotal for minimum fare check
            
        Returns:
            PromoCode object or None
            
        Raises:
            ValueError: If promo code is invalid or expired
        """
        try:
            promo = PromoCode.objects.get(code=promo_code_str, is_active=True)
        except PromoCode.DoesNotExist:
            return None
        
        now = timezone.now()
        
        # Check validity period
        if not (promo.valid_from <= now <= promo.valid_until):
            raise ValueError(f"Promo code '{promo_code_str}' has expired or not yet valid")
        
        # Check total usage limit
        if promo.max_uses and promo.total_uses >= promo.max_uses:
            raise ValueError(f"Promo code '{promo_code_str}' has reached maximum uses")
        
        # Check minimum fare requirement
        if subtotal and subtotal < promo.minimum_fare_required:
            raise ValueError(
                f"Minimum fare of {promo.minimum_fare_required} required for this promo"
            )
        
        # Check per-user usage limit
        if user_id:
            from .models import Trip
            user_usage_count = Trip.objects.filter(
                user_id=user_id,
                promo_code=promo
            ).count()
            
            if user_usage_count >= promo.max_uses_per_user:
                raise ValueError(
                    f"You have already used this promo code {promo.max_uses_per_user} times"
                )
        
        # Check applicable ride types
        if promo.applicable_ride_types != 'all':
            ride_types = [rt.strip() for rt in promo.applicable_ride_types.split(',')]
            if self.ride_type not in ride_types:
                raise ValueError(
                    f"Promo code is not applicable to {self.ride_type} rides"
                )
        
        return promo
    
    def calculate_discount(self, promo_code, subtotal):
        """
        Calculate discount amount from a promo code.
        
        Args:
            promo_code (PromoCode): Promo code object
            subtotal (Decimal): Current subtotal
            
        Returns:
            Decimal: Discount amount
        """
        if promo_code.discount_type == 'percentage':
            discount = (subtotal * promo_code.discount_value) / Decimal('100')
            
            # Cap the discount if maximum_discount is set
            if promo_code.maximum_discount:
                discount = min(discount, promo_code.maximum_discount)
        else:  # fixed
            discount = promo_code.discount_value
            
            # Don't discount more than the subtotal
            discount = min(discount, subtotal)
        
        return discount
    
    def round_fare(self, amount):
        """
        Round the fare according to configuration.
        
        Args:
            amount (Decimal): Amount to round
            
        Returns:
            Decimal: Rounded amount
        """
        quantize_value = Decimal(10) ** -self.config.decimal_places
        
        if self.config.rounding_method == 'up':
            return amount.quantize(quantize_value, rounding=ROUND_UP)
        elif self.config.rounding_method == 'down':
            return amount.quantize(quantize_value, rounding=ROUND_DOWN)
        else:  # nearest
            return amount.quantize(quantize_value, rounding=ROUND_HALF_UP)
    
    def enforce_minimum_fare(self, fare):
        """
        Ensure fare meets the minimum requirement.
        
        Args:
            fare (Decimal): Current fare
            
        Returns:
            Decimal: Fare after minimum enforcement
        """
        return max(fare, self.config.minimum_fare)
    
    def enforce_maximum_fare(self, fare):
        """
        Enforce maximum fare cap if configured.
        
        Args:
            fare (Decimal): Current fare
            
        Returns:
            Decimal: Fare after maximum enforcement
        """
        if self.config.maximum_fare:
            return min(fare, self.config.maximum_fare)
        return fare
    
    def calculate_fare(self, distance_km=None, duration_minutes=None, 
                       waiting_minutes=0, surge_multiplier=None,
                       promo_code_str=None, user_id=None, 
                       lat1=None, lon1=None, lat2=None, lon2=None,
                       tax_rate=Decimal('0.00')):
        """
        Calculate complete fare with all components.
        
        Args:
            distance_km (float): Distance in kilometers (or provide coordinates)
            duration_minutes (int): Trip duration in minutes
            waiting_minutes (int): Waiting time in minutes
            surge_multiplier (Decimal): Custom surge multiplier
            promo_code_str (str): Promo code string
            user_id (int): User ID for validation
            lat1, lon1, lat2, lon2: Coordinates to calculate distance
            tax_rate (Decimal): Tax rate as percentage
            
        Returns:
            dict: Detailed fare breakdown
            
        Raises:
            ValueError: If inputs are invalid
        """
        
        # Validate inputs
        if duration_minutes is None:
            raise ValueError("duration_minutes is required")
        
        # Calculate distance if coordinates provided
        if lat1 is not None and lon1 is not None and lat2 is not None and lon2 is not None:
            distance_km = self.calculate_distance_km(lat1, lon1, lat2, lon2)
        elif distance_km is None:
            raise ValueError(
                "Provide either distance_km or all four coordinates (lat1, lon1, lat2, lon2)"
            )
        
        # Handle zero distance edge case
        if distance_km == 0 and duration_minutes == 0:
            raise ValueError("Cannot calculate fare for zero distance and zero duration")
        
        # Calculate charge components
        distance_charge = self.calculate_distance_charge(distance_km)
        time_charge = self.calculate_time_charge(duration_minutes)
        waiting_charge = self.calculate_waiting_charge(waiting_minutes)
        
        # Base calculation before surge
        subtotal_before_surge = (
            self.config.base_fare +
            distance_charge +
            time_charge +
            waiting_charge
        )
        
        # Apply surge pricing
        subtotal, multiplier_used = self.apply_surge_pricing(
            subtotal_before_surge,
            surge_multiplier
        )
        
        # Apply minimum fare before discounts
        subtotal = self.enforce_minimum_fare(subtotal)
        
        # Initialize discount tracking
        discount_promo = Decimal('0.00')
        promo_code_applied = None
        
        # Validate and apply promo code
        if promo_code_str:
            try:
                promo_code = self.validate_promo_code(
                    promo_code_str,
                    user_id=user_id,
                    subtotal=subtotal
                )
                if promo_code:
                    discount_promo = self.calculate_discount(promo_code, subtotal)
                    promo_code_applied = promo_code
            except ValueError as e:
                raise e
        
        # Total discount
        total_discount = discount_promo
        
        # Calculate subtotal after discounts
        subtotal_after_discount = subtotal - total_discount
        
        # Calculate tax
        tax_amount = (subtotal_after_discount * tax_rate) / Decimal('100')
        
        # Final fare
        final_fare = subtotal_after_discount + tax_amount
        
        # Apply maximum fare cap
        final_fare = self.enforce_maximum_fare(final_fare)
        
        # Round the final fare
        final_fare = self.round_fare(final_fare)
        
        # Build detailed breakdown
        breakdown = {
            'base_fare': self.round_fare(self.config.base_fare),
            'distance_charge': self.round_fare(distance_charge),
            'time_charge': self.round_fare(time_charge),
            'waiting_charge': self.round_fare(waiting_charge),
            'subtotal_before_surge': self.round_fare(subtotal_before_surge),
            'surge_multiplier': multiplier_used,
            'subtotal_after_surge': self.round_fare(subtotal),
            'discount_promo': self.round_fare(discount_promo),
            'promo_code': promo_code_str if promo_code_applied else None,
            'total_discount': self.round_fare(total_discount),
            'tax_rate': tax_rate,
            'tax_amount': self.round_fare(tax_amount),
            'final_fare': final_fare,
            'currency': self.currency,
            'distance_km': round(float(distance_km), 2),
            'duration_minutes': duration_minutes,
            'waiting_minutes': waiting_minutes,
        }
        
        return breakdown
    
    def create_fare_record(self, trip, breakdown):
        """
        Create a FareCalculation record from breakdown data.
        
        Args:
            trip (Trip): Trip object
            breakdown (dict): Fare breakdown from calculate_fare()
            
        Returns:
            FareCalculation: Created fare calculation record
        """
        fare_calc = FareCalculation.objects.create(
            trip=trip,
            fare_config=self.config,
            base_fare=breakdown['base_fare'],
            distance_charge=breakdown['distance_charge'],
            time_charge=breakdown['time_charge'],
            waiting_charge=breakdown['waiting_charge'],
            surge_multiplier_applied=breakdown['surge_multiplier'],
            subtotal=breakdown['subtotal_after_surge'],
            discount_promo=breakdown['discount_promo'],
            total_discount=breakdown['total_discount'],
            tax_rate=breakdown['tax_rate'],
            tax_amount=breakdown['tax_amount'],
            final_fare=breakdown['final_fare'],
            currency=breakdown['currency'],
            calculation_method='standard',
        )
        
        # Link promo code if applied
        if breakdown['promo_code']:
            try:
                promo = PromoCode.objects.get(code=breakdown['promo_code'])
                fare_calc.promo_code_applied = promo
                fare_calc.save(update_fields=['promo_code_applied'])
            except PromoCode.DoesNotExist:
                pass
        
        return fare_calc
