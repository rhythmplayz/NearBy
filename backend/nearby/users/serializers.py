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

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating user profiles.
    """
    # Read-only field to show the name of the neighbourhood instead of just the ID
    neighbourhood_name = serializers.ReadOnlyField(source='neighbourhood.name')
    
    class Meta:
        model = User
        fields = [
            'full_name', 'username', 'email', 'address', 
            'phone', 'neighbourhood', 'neighbourhood_name', 'profile_pic'
        ]
        # Prevent users from changing their username or email through the profile update
        read_only_fields = ['username', 'email']

    def get_profile_pic(self, obj):
        """
        DRF handles absolute URLs for ImageFields automatically if 
        'request' is in the context, but this is a fallback.
        """
        if obj.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
        return None