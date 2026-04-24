from rest_framework import serializers
from .models import Seller

class SellerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Seller
        fields = [
            'id', 'username', 'password', 'email', 'full_name', 
            'phone', 'address', 'profile_pic', 'business_name', 
            'neighbourhood', 'verification_status', 'rating'
        ]

        read_only_fields = ['verification_status', 'rating']

    def create(self, validated_data):
        validated_data['user_type'] = 'seller'
        
        seller = Seller.objects.create_user(**validated_data)
        return seller