from rest_framework import serializers
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email', 'full_name', 
            'phone', 'address', 'profile_pic', 'neighbourhood'
        ]

    def create(self, validated_data):
        validated_data['user_type'] = 'user'
        
        user = User.objects.create_user(**validated_data)
        return user
