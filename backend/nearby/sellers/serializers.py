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

class SellerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating seller profiles.
    """
    class Meta:
        model = Seller
        fields = [
            'full_name', 'username', 'email', 'address', 'phone', 
            'business_name', 'neighbourhood', 'profile_pic', 
            'verification_status', 'rating'
        ]
        read_only_fields = ['username', 'email', 'verification_status', 'rating']

    def get_profile_pic(self, obj):
        if obj.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
        return None