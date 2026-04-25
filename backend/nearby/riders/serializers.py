from rest_framework import serializers
from .models import Rider


class RiderRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Rider
        fields = [
            'id', 'username', 'password', 'email', 'full_name',
            'phone', 'address', 'profile_pic', 'vehicle_type',
            'license_number', 'neighbourhood', 'rating'
        ]
        read_only_fields = ['rating']

    def create(self, validated_data):
        validated_data['user_type'] = 'rider'
        rider = Rider.objects.create_user(**validated_data)
        return rider
