from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Admin
from .models import ReportDefinition, GeneratedReport, ReportAccessLog


class ReportDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDefinition
        fields = ['id', 'name', 'slug', 'report_type', 'description', 'owner', 'default_params', 'schedule', 'allow_custom_params', 'created_at', 'updated_at']


class GeneratedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedReport
        fields = ['id', 'definition', 'requested_by', 'params', 'status', 'file', 'row_count', 'error', 'created_at', 'completed_at']


class ReportAccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAccessLog
        fields = ['id', 'report', 'user', 'action', 'ip_address', 'timestamp']


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
    
class AdminProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating Admin profiles.
    """
    class Meta:
        model = Admin
        fields = [
            'full_name', 'username', 'email', 'phone', 
            'address', 'profile_pic', 'user_type', 'status'
        ]
        # Admins cannot change their username, email, or system role via the profile page
        read_only_fields = ['username', 'email', 'user_type', 'status']

    def get_profile_pic(self, obj):
        """
        Ensures the absolute URL for the profile picture is returned.
        """
        if obj.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
        return None