from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import FareConfiguration, PromoCode, Trip, FareCalculation
from .serializers import (
    FareCalculationBreakdownSerializer,
    FareCalculationRequestSerializer,
    FareCalculationSerializer,
    FareHistorySerializer,
    PromoCodeSerializer,
    FareConfigurationSerializer,
)
from .services import FareCalculationService


@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_fare(request):
    """
    Calculate fare for a trip.
    
    Accepts either:
    1. Coordinates: pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude
    2. Direct distance: distance_km
    
    Required: duration_minutes, ride_type (optional)
    Optional: waiting_minutes, promo_code, surge_multiplier, tax_rate
    
    Returns detailed fare breakdown.
    """
    serializer = FareCalculationRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {
                'status': 'error',
                'message': 'Invalid request parameters',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_data = serializer.validated_data
    
    try:
        # Initialize fare calculation service
        ride_type = validated_data.get('ride_type', 'economy')
        currency = validated_data.get('currency', 'USD')
        
        service = FareCalculationService(ride_type=ride_type, currency=currency)
        
        # Extract parameters
        distance_km = validated_data.get('distance_km')
        lat1 = validated_data.get('pickup_latitude')
        lon1 = validated_data.get('pickup_longitude')
        lat2 = validated_data.get('dropoff_latitude')
        lon2 = validated_data.get('dropoff_longitude')
        
        # Calculate fare
        breakdown = service.calculate_fare(
            distance_km=distance_km,
            duration_minutes=validated_data['duration_minutes'],
            waiting_minutes=validated_data.get('waiting_minutes', 0),
            surge_multiplier=validated_data.get('surge_multiplier'),
            promo_code_str=validated_data.get('promo_code'),
            user_id=request.user.id if request.user.is_authenticated else None,
            lat1=lat1,
            lon1=lon1,
            lat2=lat2,
            lon2=lon2,
            tax_rate=Decimal(str(validated_data.get('tax_rate', '0.00')))
        )
        
        # Serialize breakdown
        breakdown_serializer = FareCalculationBreakdownSerializer(breakdown)
        
        return Response(
            {
                'status': 'success',
                'message': 'Fare calculated successfully',
                'data': breakdown_serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    except ValueError as e:
        return Response(
            {
                'status': 'error',
                'message': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        return Response(
            {
                'status': 'error',
                'message': 'An error occurred while calculating fare',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_promo_code(request):
    """
    Validate a promo code without calculating full fare.
    
    Request body:
    {
        "promo_code": "SUMMER2024",
        "ride_type": "economy",
        "currency": "USD",
        "subtotal": 25.50
    }
    """
    promo_code_str = request.data.get('promo_code')
    ride_type = request.data.get('ride_type', 'economy')
    currency = request.data.get('currency', 'USD')
    subtotal = request.data.get('subtotal')
    
    if not promo_code_str:
        return Response(
            {
                'status': 'error',
                'message': 'promo_code is required'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        service = FareCalculationService(ride_type=ride_type, currency=currency)
        
        if subtotal:
            subtotal = Decimal(str(subtotal))
        
        promo = service.validate_promo_code(
            promo_code_str,
            user_id=request.user.id,
            subtotal=subtotal
        )
        
        if not promo:
            return Response(
                {
                    'status': 'error',
                    'message': f'Invalid promo code: {promo_code_str}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PromoCodeSerializer(promo)
        return Response(
            {
                'status': 'success',
                'message': 'Promo code is valid',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    except ValueError as e:
        return Response(
            {
                'status': 'error',
                'message': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        return Response(
            {
                'status': 'error',
                'message': 'An error occurred while validating promo code',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class FareConfigurationListView(generics.ListAPIView):
    """List active fare configurations."""
    queryset = FareConfiguration.objects.filter(is_active=True)
    serializer_class = FareConfigurationSerializer
    permission_classes = [AllowAny]


class PromoCodeListView(generics.ListAPIView):
    """List available promo codes."""
    queryset = PromoCode.objects.filter(is_active=True)
    serializer_class = PromoCodeSerializer
    permission_classes = [AllowAny]


class TripDetailView(generics.RetrieveUpdateAPIView):
    """Get or update trip details."""
    queryset = Trip.objects.all()
    serializer_class = FareHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        trip = get_object_or_404(Trip, id=self.kwargs['trip_id'])
        
        # Check permission: user can only view their own trips
        if trip.user != self.request.user and not self.request.user.is_staff:
            self.permission_denied(self.request)
        
        return trip


class FareHistoryView(generics.ListAPIView):
    """Get fare history for authenticated user."""
    serializer_class = FareHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return trips for the current user."""
        return Trip.objects.filter(
            user=self.request.user
        ).select_related('fare_calculation').order_by('-requested_at')


class FareCalculationDetailView(generics.RetrieveAPIView):
    """Get detailed fare calculation for a trip."""
    queryset = FareCalculation.objects.all()
    serializer_class = FareCalculationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        fare_calc = get_object_or_404(
            FareCalculation,
            id=self.kwargs['fare_id']
        )
        
        # Check permission: user can only view their own fare calculations
        if fare_calc.trip.user != self.request.user and not self.request.user.is_staff:
            self.permission_denied(self.request)
        
        return fare_calc


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fare_statistics(request):
    """
    Get fare statistics for the authenticated user.
    
    Returns:
    - Total trips
    - Total fare spent
    - Average fare
    - Highest fare
    - Lowest fare
    - Total discount applied
    - Most used promo code
    """
    from django.db.models import Sum, Avg, Max, Min, Count, Q
    from django.db.models.functions import TruncDate
    
    try:
        trips = Trip.objects.filter(user=request.user, status='completed')
        
        if not trips.exists():
            return Response(
                {
                    'status': 'success',
                    'message': 'No completed trips found',
                    'data': {
                        'total_trips': 0,
                        'total_fare_spent': '0.00',
                        'average_fare': '0.00',
                        'highest_fare': '0.00',
                        'lowest_fare': '0.00',
                        'total_distance_km': '0.00',
                        'total_discount_applied': '0.00',
                        'ride_types_breakdown': {}
                    }
                },
                status=status.HTTP_200_OK
            )
        
        fare_calcs = FareCalculation.objects.filter(trip__in=trips)
        
        stats = fare_calcs.aggregate(
            total_fare=Sum('final_fare'),
            average_fare=Avg('final_fare'),
            highest_fare=Max('final_fare'),
            lowest_fare=Min('final_fare'),
            total_discount=Sum('total_discount')
        )
        
        trip_stats = trips.aggregate(
            total_distance=Sum('actual_distance_km'),
            total_trips=Count('id')
        )
        
        # Breakdown by ride type
        ride_type_breakdown = trips.values('ride_type').annotate(
            count=Count('id'),
            total_fare=Sum('fare_calculation__final_fare')
        ).order_by('ride_type')
        
        ride_breakdown_dict = {
            item['ride_type']: {
                'count': item['count'],
                'total_fare': str(item['total_fare'] or '0.00')
            }
            for item in ride_type_breakdown
        }
        
        return Response(
            {
                'status': 'success',
                'message': 'Fare statistics retrieved successfully',
                'data': {
                    'total_trips': trip_stats['total_trips'],
                    'total_fare_spent': str(stats['total_fare'] or '0.00'),
                    'average_fare': str(stats['average_fare'] or '0.00'),
                    'highest_fare': str(stats['highest_fare'] or '0.00'),
                    'lowest_fare': str(stats['lowest_fare'] or '0.00'),
                    'total_distance_km': str(trip_stats['total_distance'] or '0.00'),
                    'total_discount_applied': str(stats['total_discount'] or '0.00'),
                    'ride_types_breakdown': ride_breakdown_dict
                }
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {
                'status': 'error',
                'message': 'An error occurred while retrieving fare statistics',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
