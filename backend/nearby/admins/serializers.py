from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Admin


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.user_type != 'admin':
            raise AuthenticationFailed('Only admin accounts can login here.')

        return data

class AdminRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Admin
        fields = ['username', 'email', 'full_name', 'phone', 'address', 'password']

    def create(self, validated_data):
        # Force user_type to 'admin' for compatibility with Admin portal login[cite: 25]
        validated_data['user_type'] = 'admin'
        validated_data['is_staff'] = True
        validated_data['status'] = 'active'
        
        # Pop password to hash it properly using set_password[cite: 23]
        password = validated_data.pop('password')
        admin = Admin(**validated_data)
        admin.set_password(password)
        admin.save()
        return admin