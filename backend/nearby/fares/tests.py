from django.test import TestCase
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import FareConfiguration, PromoCode, Trip, FareCalculation
from .services import FareCalculationService
from riders.models import Rider

User = get_user_model()


class FareCalculationServiceTests(TestCase):
    """Test suite for FareCalculationService."""
    
    def setUp(self):
        """Set up test data."""
        # Create fare configuration
        self.fare_config = FareConfiguration.objects.create(
            ride_type='economy',
            currency='USD',
            base_fare=Decimal('2.50'),
            per_km_rate=Decimal('1.50'),
            per_minute_rate=Decimal('0.25'),
            surge_multiplier=Decimal('1.00'),
            waiting_charge_per_minute=Decimal('0.50'),
            free_waiting_minutes=5,
            minimum_fare=Decimal('3.50'),
            maximum_fare=Decimal('100.00'),
            rounding_method='nearest',
            decimal_places=2,
            is_active=True
        )
    
    def test_service_initialization(self):
        """Test service initialization."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        self.assertEqual(service.ride_type, 'economy')
        self.assertEqual(service.currency, 'USD')
        self.assertEqual(service.config, self.fare_config)
    
    def test_distance_calculation_haversine(self):
        """Test distance calculation using Haversine formula."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        # New York to Boston (approximately 306 km)
        lat1, lon1 = 40.7128, -74.0060  # NYC
        lat2, lon2 = 42.3601, -71.0589  # Boston
        
        distance = service.calculate_distance_km(lat1, lon1, lat2, lon2)
        
        # Distance should be approximately 306 km (allowing 5% margin)
        self.assertGreater(distance, 290)
        self.assertLess(distance, 320)
    
    def test_distance_charge_calculation(self):
        """Test distance-based charge calculation."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        distance = Decimal('10.5')
        charge = service.calculate_distance_charge(distance)
        
        expected = distance * self.fare_config.per_km_rate
        self.assertEqual(charge, expected)
    
    def test_time_charge_calculation(self):
        """Test time-based charge calculation."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        duration = 25
        charge = service.calculate_time_charge(duration)
        
        expected = Decimal(str(duration)) * self.fare_config.per_minute_rate
        self.assertEqual(charge, expected)
    
    def test_waiting_charge_with_free_period(self):
        """Test waiting charge calculation with free waiting period."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        # 10 minutes waiting, 5 minutes free, so 5 chargeable minutes
        waiting = 10
        charge = service.calculate_waiting_charge(waiting)
        
        expected = Decimal('5') * self.fare_config.waiting_charge_per_minute
        self.assertEqual(charge, expected)
    
    def test_waiting_charge_within_free_period(self):
        """Test waiting charge within free period should be zero."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        waiting = 3  # Less than 5 free minutes
        charge = service.calculate_waiting_charge(waiting)
        
        self.assertEqual(charge, Decimal('0.00'))
    
    def test_surge_pricing_application(self):
        """Test surge pricing multiplier application."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        base_charge = Decimal('25.00')
        surge_multiplier = Decimal('1.5')
        
        surged_charge, used_multiplier = service.apply_surge_pricing(
            base_charge,
            surge_multiplier
        )
        
        expected = base_charge * surge_multiplier
        self.assertEqual(surged_charge, expected)
        self.assertEqual(used_multiplier, surge_multiplier)
    
    def test_default_surge_pricing(self):
        """Test surge pricing with default config value."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        base_charge = Decimal('25.00')
        surged_charge, used_multiplier = service.apply_surge_pricing(base_charge)
        
        expected = base_charge * self.fare_config.surge_multiplier
        self.assertEqual(surged_charge, expected)
    
    def test_promo_code_validation_valid(self):
        """Test promo code validation with valid code."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        promo = PromoCode.objects.create(
            code='SUMMER2024',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            applicable_ride_types='all',
            max_uses=100,
            max_uses_per_user=5,
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            minimum_fare_required=Decimal('5.00'),
            is_active=True
        )
        
        validated = service.validate_promo_code('SUMMER2024')
        self.assertEqual(validated, promo)
    
    def test_promo_code_validation_expired(self):
        """Test promo code validation with expired code."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        PromoCode.objects.create(
            code='EXPIRED2024',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=30),
            valid_until=now - timedelta(days=1),
            is_active=True
        )
        
        with self.assertRaises(ValueError):
            service.validate_promo_code('EXPIRED2024')
    
    def test_discount_calculation_percentage(self):
        """Test discount calculation for percentage-based promo."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        promo = PromoCode.objects.create(
            code='10PERCENT',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            is_active=True
        )
        
        subtotal = Decimal('100.00')
        discount = service.calculate_discount(promo, subtotal)
        
        expected = Decimal('10.00')  # 10% of 100
        self.assertEqual(discount, expected)
    
    def test_discount_calculation_fixed(self):
        """Test discount calculation for fixed amount promo."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        promo = PromoCode.objects.create(
            code='FIXED5',
            discount_type='fixed',
            discount_value=Decimal('5.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            is_active=True
        )
        
        subtotal = Decimal('100.00')
        discount = service.calculate_discount(promo, subtotal)
        
        self.assertEqual(discount, Decimal('5.00'))
    
    def test_discount_respects_maximum_discount(self):
        """Test that discount respects maximum_discount cap."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        promo = PromoCode.objects.create(
            code='20PERCENT',
            discount_type='percentage',
            discount_value=Decimal('20.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            maximum_discount=Decimal('10.00'),  # Cap at 10
            is_active=True
        )
        
        subtotal = Decimal('100.00')
        discount = service.calculate_discount(promo, subtotal)
        
        self.assertEqual(discount, Decimal('10.00'))  # Capped at max
    
    def test_fare_rounding_up(self):
        """Test fare rounding to nearest (ROUND_HALF_UP)."""
        config = FareConfiguration.objects.create(
            ride_type='premium',
            currency='USD',
            base_fare=Decimal('2.50'),
            per_km_rate=Decimal('1.50'),
            per_minute_rate=Decimal('0.25'),
            minimum_fare=Decimal('3.50'),
            rounding_method='nearest',
            decimal_places=2,
            is_active=True
        )
        
        service = FareCalculationService(ride_type='premium', currency='USD')
        
        amount = Decimal('19.125')
        rounded = service.round_fare(amount)
        
        self.assertEqual(rounded, Decimal('19.13'))
    
    def test_minimum_fare_enforcement(self):
        """Test minimum fare enforcement."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        low_fare = Decimal('1.50')
        enforced = service.enforce_minimum_fare(low_fare)
        
        self.assertEqual(enforced, self.fare_config.minimum_fare)
    
    def test_maximum_fare_enforcement(self):
        """Test maximum fare enforcement."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        high_fare = Decimal('150.00')
        enforced = service.enforce_maximum_fare(high_fare)
        
        self.assertEqual(enforced, self.fare_config.maximum_fare)
    
    def test_complete_fare_calculation_with_distance(self):
        """Test complete fare calculation with distance."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        breakdown = service.calculate_fare(
            distance_km=10.5,
            duration_minutes=25,
            waiting_minutes=0,
            surge_multiplier=None,
            promo_code_str=None,
            tax_rate=Decimal('0.00')
        )
        
        # Verify breakdown has all components
        self.assertIn('base_fare', breakdown)
        self.assertIn('distance_charge', breakdown)
        self.assertIn('time_charge', breakdown)
        self.assertIn('final_fare', breakdown)
        
        # Verify final fare meets minimum
        self.assertGreaterEqual(
            breakdown['final_fare'],
            self.fare_config.minimum_fare
        )
    
    def test_complete_fare_calculation_with_coordinates(self):
        """Test complete fare calculation using coordinates."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        # NYC to a nearby location
        lat1, lon1 = 40.7128, -74.0060
        lat2, lon2 = 40.7580, -73.9855
        
        breakdown = service.calculate_fare(
            duration_minutes=20,
            waiting_minutes=0,
            lat1=lat1,
            lon1=lon1,
            lat2=lat2,
            lon2=lon2,
            tax_rate=Decimal('0.00')
        )
        
        self.assertIn('distance_km', breakdown)
        self.assertGreater(breakdown['distance_km'], 0)
        self.assertIn('final_fare', breakdown)
    
    def test_fare_calculation_with_tax(self):
        """Test fare calculation with tax."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        breakdown = service.calculate_fare(
            distance_km=10.5,
            duration_minutes=25,
            tax_rate=Decimal('8.875')  # NYC tax rate
        )
        
        self.assertGreater(breakdown['tax_amount'], Decimal('0.00'))
        self.assertEqual(breakdown['tax_rate'], Decimal('8.875'))
    
    def test_fare_calculation_with_promo_code(self):
        """Test fare calculation with promo code."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        now = timezone.now()
        PromoCode.objects.create(
            code='WELCOME10',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            is_active=True
        )
        
        breakdown = service.calculate_fare(
            distance_km=10.5,
            duration_minutes=25,
            promo_code_str='WELCOME10'
        )
        
        self.assertGreater(breakdown['discount_promo'], Decimal('0.00'))
        self.assertEqual(breakdown['promo_code'], 'WELCOME10')
    
    def test_zero_distance_and_duration_error(self):
        """Test that zero distance and duration raises error."""
        service = FareCalculationService(ride_type='economy', currency='USD')
        
        with self.assertRaises(ValueError):
            service.calculate_fare(
                distance_km=0,
                duration_minutes=0
            )


class FareCalculationAPITests(APITestCase):
    """Test suite for fare calculation API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        # Create fare configuration
        self.fare_config = FareConfiguration.objects.create(
            ride_type='economy',
            currency='USD',
            base_fare=Decimal('2.50'),
            per_km_rate=Decimal('1.50'),
            per_minute_rate=Decimal('0.25'),
            minimum_fare=Decimal('3.50'),
            is_active=True
        )
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        
        self.client = APIClient()
    
    def test_calculate_fare_endpoint_with_distance(self):
        """Test fare calculation endpoint with distance."""
        url = '/api/fares/calculate/'
        data = {
            'distance_km': 10.5,
            'duration_minutes': 25,
            'ride_type': 'economy'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertIn('final_fare', response.data['data'])
    
    def test_calculate_fare_endpoint_with_coordinates(self):
        """Test fare calculation endpoint with coordinates."""
        url = '/api/fares/calculate/'
        data = {
            'pickup_latitude': 40.7128,
            'pickup_longitude': -74.0060,
            'dropoff_latitude': 40.7580,
            'dropoff_longitude': -73.9855,
            'duration_minutes': 20,
            'ride_type': 'economy'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
    
    def test_calculate_fare_missing_duration(self):
        """Test fare calculation with missing required parameter."""
        url = '/api/fares/calculate/'
        data = {
            'distance_km': 10.5,
            'ride_type': 'economy'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_calculate_fare_missing_location(self):
        """Test fare calculation with missing location data."""
        url = '/api/fares/calculate/'
        data = {
            'duration_minutes': 25,
            'ride_type': 'economy'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_validate_promo_code_endpoint_valid(self):
        """Test promo code validation endpoint."""
        now = timezone.now()
        PromoCode.objects.create(
            code='VALID10',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            applicable_ride_types='all',
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=30),
            is_active=True
        )
        
        self.client.force_authenticate(user=self.user)
        
        url = '/api/fares/validate-promo/'
        data = {
            'promo_code': 'VALID10',
            'ride_type': 'economy',
            'subtotal': 25.50
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
    
    def test_validate_promo_code_invalid(self):
        """Test promo code validation with invalid code."""
        self.client.force_authenticate(user=self.user)
        
        url = '/api/fares/validate-promo/'
        data = {
            'promo_code': 'INVALID999',
            'ride_type': 'economy'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_fare_configurations(self):
        """Test retrieving fare configurations."""
        url = '/api/fares/configurations/'
        
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
    
    def test_fare_statistics_authenticated_user(self):
        """Test fare statistics endpoint for authenticated user."""
        self.client.force_authenticate(user=self.user)
        
        url = '/api/fares/statistics/'
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
    
    def test_fare_statistics_unauthenticated(self):
        """Test fare statistics endpoint without authentication."""
        url = '/api/fares/statistics/'
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
