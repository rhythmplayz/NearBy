from django.db.models import Count
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import RiderSupportReport
from .serializers import (
    RiderRegistrationSerializer,
    RiderSupportReportAdminSerializer,
    RiderSupportReportSerializer,
    RiderTokenObtainPairSerializer,
    RiderProfileSerializer,
)


def is_rider(user):
    return getattr(user, 'user_type', None) == 'rider'


def is_admin(user):
    return getattr(user, 'user_type', None) == 'admin'


class RiderTokenObtainPairView(TokenObtainPairView):
    serializer_class = RiderTokenObtainPairSerializer


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


class RiderSupportReportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if is_rider(request.user):
            reports = RiderSupportReport.objects.filter(rider=request.user)
        elif is_admin(request.user):
            reports = RiderSupportReport.objects.all()
        else:
            return Response({'detail': 'Only riders and admins can view reports.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RiderSupportReportSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not is_rider(request.user):
            return Response({'detail': 'Only riders can submit reports.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RiderSupportReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            report = serializer.save()
            return Response(
                {
                    'message': 'Your report has been submitted successfully.',
                    'report': RiderSupportReportSerializer(report, context={'request': request}).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RiderSupportReportDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, pk):
        return RiderSupportReport.objects.get(pk=pk)

    def get(self, request, pk):
        try:
            report = self.get_object(pk)
        except RiderSupportReport.DoesNotExist:
            return Response({'detail': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not (is_admin(request.user) or report.rider_id == request.user.id):
            return Response({'detail': 'You do not have permission to view this report.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RiderSupportReportSerializer(report, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRiderReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        reports = RiderSupportReport.objects.select_related('rider').all()
        serializer = RiderSupportReportAdminSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRiderReportStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            report = RiderSupportReport.objects.get(pk=pk)
        except RiderSupportReport.DoesNotExist:
            return Response({'detail': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RiderSupportReportAdminSerializer(report, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            report = serializer.save()
            response_message = 'Report updated successfully.'
            if report.status == 'resolved':
                response_message = 'Report resolved and rider notified.'
            elif report.status == 'in_progress':
                response_message = 'Report marked in progress.'

            return Response(
                {
                    'message': response_message,
                    'report': RiderSupportReportAdminSerializer(report, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminRiderReportAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        status_counts = {
            item['status']: item['total']
            for item in RiderSupportReport.objects.values('status').annotate(total=Count('id'))
        }
        type_counts = {
            item['report_type']: item['total']
            for item in RiderSupportReport.objects.values('report_type').annotate(total=Count('id'))
        }
        unresolved_reports = RiderSupportReport.objects.exclude(status='resolved').count()
        resolved_reports = RiderSupportReport.objects.filter(status='resolved').count()

        recent_reports = RiderSupportReport.objects.select_related('rider')[:5]
        recent_serializer = RiderSupportReportAdminSerializer(recent_reports, many=True, context={'request': request})

        average_resolution_hours = None
        resolved_query = RiderSupportReport.objects.filter(
            status='resolved',
            responded_at__isnull=False,
            resolved_at__isnull=False,
        )
        if resolved_query.exists():
            total_seconds = 0
            for report in resolved_query:
                total_seconds += (report.resolved_at - report.submitted_at).total_seconds()
            average_resolution_hours = round(total_seconds / resolved_query.count() / 3600, 2)

        return Response(
            {
                'summary': {
                    'total_reports': RiderSupportReport.objects.count(),
                    'resolved_reports': resolved_reports,
                    'open_reports': unresolved_reports,
                },
                'status_counts': status_counts,
                'type_counts': type_counts,
                'average_resolution_hours': average_resolution_hours,
                'recent_reports': recent_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RiderProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if not is_rider(request.user):
            return Response({'detail': 'Rider access required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = RiderProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        if not is_rider(request.user):
            return Response({'detail': 'Rider access required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = RiderProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
