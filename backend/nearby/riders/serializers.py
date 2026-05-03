from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Rider
from .models import RiderSupportReport


class RiderTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_type'] = user.user_type
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.user_type != 'rider':
            raise AuthenticationFailed('Only rider accounts can login here.')

        data['user_type'] = self.user.user_type
        return data


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
        password = validated_data.pop('password')
        rider = Rider(**validated_data)
        rider.set_password(password)
        rider.save()
        return rider


class RiderSupportReportSerializer(serializers.ModelSerializer):
    rider_name = serializers.CharField(source='rider.full_name', read_only=True)
    rider_username = serializers.CharField(source='rider.username', read_only=True)
    report_type_label = serializers.CharField(source='get_report_type_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = RiderSupportReport
        fields = [
            'id', 'rider', 'rider_name', 'rider_username',
            'report_type', 'report_type_label', 'subject', 'description',
            'location', 'attachment', 'attachment_url', 'status', 'status_label',
            'admin_response', 'submitted_at', 'updated_at', 'responded_at', 'resolved_at',
        ]
        read_only_fields = [
            'id', 'rider', 'rider_name', 'rider_username', 'report_type_label',
            'attachment_url', 'status', 'status_label', 'admin_response',
            'submitted_at', 'updated_at', 'responded_at', 'resolved_at',
        ]

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        url = obj.attachment.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def create(self, validated_data):
        validated_data['rider'] = self.context['request'].user
        return RiderSupportReport.objects.create(**validated_data)


class RiderSupportReportAdminSerializer(serializers.ModelSerializer):
    rider_name = serializers.CharField(source='rider.full_name', read_only=True)
    rider_username = serializers.CharField(source='rider.username', read_only=True)
    report_type_label = serializers.CharField(source='get_report_type_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = RiderSupportReport
        fields = [
            'id', 'rider_name', 'rider_username', 'report_type', 'report_type_label',
            'subject', 'description', 'location', 'attachment', 'attachment_url',
            'status', 'status_label', 'admin_response', 'submitted_at', 'updated_at',
            'responded_at', 'resolved_at',
        ]
        read_only_fields = [
            'id', 'rider_name', 'rider_username', 'report_type_label', 'attachment_url',
            'submitted_at', 'updated_at', 'responded_at', 'resolved_at',
        ]

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        url = obj.attachment.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def update(self, instance, validated_data):
        previous_status = instance.status
        instance = super().update(instance, validated_data)
        if instance.status != previous_status:
            if instance.status in ('in_progress', 'resolved') and instance.responded_at is None:
                instance.responded_at = timezone.now()
            if instance.status == 'resolved' and instance.resolved_at is None:
                instance.resolved_at = timezone.now()
            instance.save(update_fields=['status', 'admin_response', 'responded_at', 'resolved_at', 'updated_at'])
        return instance


class RiderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rider
        fields = [
            'full_name', 'username', 'email', 'address', 'phone',
            'profile_pic', 'vehicle_type', 'license_number',
            'neighbourhood', 'rating'
        ]
        read_only_fields = ['username', 'email', 'rating']

