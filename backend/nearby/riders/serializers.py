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


from .models import RiderReport, RiderReportAttachment


class RiderReportAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderReportAttachment
        fields = ['id', 'file', 'uploaded_at']


class ReporterSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.CharField()


class RiderReportSerializer(serializers.ModelSerializer):
    attachments = RiderReportAttachmentSerializer(many=True, read_only=True)
    reporter = ReporterSerializer(read_only=True)

    class Meta:
        model = RiderReport
        fields = ['id', 'reporter', 'report_type', 'title', 'description', 'location', 'metadata', 'status', 'assigned_to', 'admin_response', 'attachments', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class RiderReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderReport
        fields = ['status', 'assigned_to']


class AdminRiderReportUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderReport
        fields = ['status', 'assigned_to', 'admin_response']
