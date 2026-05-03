from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Seller


class SellerTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_type'] = user.user_type
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.user_type != 'seller':
            raise AuthenticationFailed('Only seller accounts can login here.')

        data['user_type'] = self.user.user_type
        return data


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
    class Meta:
        model = Seller
        fields = [
            'full_name', 'username', 'email', 'address', 'phone',
            'profile_pic', 'business_name', 'neighbourhood',
            'verification_status', 'rating'
        ]
        read_only_fields = ['username', 'email', 'verification_status', 'rating']
