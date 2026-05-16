from django.urls import path
from . import views

app_name = 'fares'

urlpatterns = [
    # Fare calculation endpoints
    path('calculate/', views.calculate_fare, name='calculate_fare'),
    path('validate-promo/', views.validate_promo_code, name='validate_promo'),
    
    # Configuration and promo codes
    path('configurations/', views.FareConfigurationListView.as_view(), name='fare_configs'),
    path('promos/', views.PromoCodeListView.as_view(), name='promo_codes'),
    
    # Trip history and details
    path('history/', views.FareHistoryView.as_view(), name='fare_history'),
    path('trips/<int:trip_id>/', views.TripDetailView.as_view(), name='trip_detail'),
    path('calculations/<int:fare_id>/', views.FareCalculationDetailView.as_view(), name='fare_detail'),
    
    # Statistics
    path('statistics/', views.fare_statistics, name='fare_statistics'),
]
