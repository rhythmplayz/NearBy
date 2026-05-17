from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RiderRegistrationSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_rider(request):
    serializer = RiderRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Rider registered successfully',
            'user_id': user.id,
            'username': user.username,
            'vehicle_type': user.vehicle_type,
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RiderReportSerializer, RiderReportAttachmentSerializer, RiderReportStatusSerializer, AdminRiderReportUpdateSerializer, RiderProfileSerializer
from .models import Rider, RiderReport, RiderReportAttachment
from admins.permissions import IsPlatformAdmin
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter


class RiderReportListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RiderReportSerializer

    def get_queryset(self):
        return RiderReport.objects.filter(reporter=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as exc:
            # log server-side for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.exception('Error creating RiderReport')
            return Response({'error': 'Failed to submit report', 'details': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RiderReportDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RiderReportSerializer
    queryset = RiderReport.objects.all()


class RiderReportAttachmentUploadAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RiderReportAttachmentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, report_pk, *args, **kwargs):
        report = get_object_or_404(RiderReport, pk=report_pk)
        if report.reporter != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        att = RiderReportAttachment.objects.create(report=report, file=file)
        return Response(RiderReportAttachmentSerializer(att).data, status=status.HTTP_201_CREATED)


class AdminRiderReportListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = RiderReportSerializer
    queryset = RiderReport.objects.all().order_by('-created_at')
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['report_type', 'status', 'reporter__id']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'status']

import csv
from django.http import HttpResponse

class AdminRiderReportExportAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['report_type', 'status', 'reporter__id']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        return RiderReport.objects.all().order_by('-created_at')

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="rider_reports.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Description', 'Report Type', 'Status', 'Reporter', 'Created At', 'Admin Response'])
        
        for report in queryset:
            writer.writerow([
                report.id,
                report.title,
                report.description,
                report.report_type,
                report.status,
                report.reporter.username if report.reporter else '',
                report.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                report.admin_response
            ])
            
        return response


class AdminRiderReportStatusUpdateAPIView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = AdminRiderReportUpdateSerializer
    queryset = RiderReport.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        # send notification
        from notifications.models import Notification, NotificationType
        if instance.reporter:
            Notification.objects.create(
                recipient=instance.reporter,
                notification_type=NotificationType.SYSTEM,
                title='Report Status Updated',
                message=f'Your report "{instance.title}" has been updated to {instance.status}.'
            )


class RiderProfileRetrieveUpdateAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RiderProfileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get(self, request, *args, **kwargs):
        # Get the Rider instance for the current user
        try:
            rider = Rider.objects.get(id=request.user.id)
        except Rider.DoesNotExist:
            return Response({'detail': 'Rider profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(rider)
        return Response(serializer.data)
    
    def patch(self, request, *args, **kwargs):
        # Get the Rider instance for the current user
        try:
            rider = Rider.objects.get(id=request.user.id)
        except Rider.DoesNotExist:
            return Response({'detail': 'Rider profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(rider, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
