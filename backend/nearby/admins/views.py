from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import AdminTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminRegistrationSerializer
from .permissions import IsPlatformAdmin
from rest_framework.views import APIView
from rest_framework import generics
from .serializers import ReportDefinitionSerializer, GeneratedReportSerializer
from .models import ReportDefinition, GeneratedReport
from django.http import StreamingHttpResponse, HttpResponse
import csv
import io
from django.utils.text import slugify
from django.db import transaction
from users.models import User
from sellers.models import Seller
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPlatformAdmin])
def register_admin(request):
    if request.user.user_type != 'admin':
        return Response(
            {"error": "Access denied. Only administrators can register other admins."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = AdminRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Admin account created successfully.", "user": serializer.data['username']},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportDefinitionListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    queryset = ReportDefinition.objects.all().order_by('-created_at')
    serializer_class = ReportDefinitionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['report_type', 'owner__id']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']


class GeneratedReportListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    queryset = GeneratedReport.objects.all().order_by('-created_at')
    serializer_class = GeneratedReportSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['definition__report_type', 'status', 'requested_by__id']
    search_fields = ['definition__name']
    ordering_fields = ['created_at', 'status']


def _query_for_report(definition_key, params):
    # Basic mapping to available models; expand as needed.
    if definition_key == 'user_activity':
        qs = User.objects.all()
        # apply simple filters from params
        if params.get('since'):
            qs = qs.filter(date_joined__gte=params['since'])
        return qs.values('id', 'username', 'email', 'full_name', 'user_type', 'status', 'date_joined', 'last_login')

    if definition_key == 'seller_performance':
        qs = Seller.objects.all()
        if params.get('min_rating'):
            qs = qs.filter(rating__gte=float(params['min_rating']))
        return qs.values('id', 'business_name', 'full_name', 'rating', 'verification_status', 'created_at')

    if definition_key == 'rider_reports':
        try:
            from riders.models import RiderReport
            qs = RiderReport.objects.all()
            # apply simple filters
            if params.get('status'):
                qs = qs.filter(status=params['status'])
            if params.get('since'):
                qs = qs.filter(created_at__gte=params['since'])
            return qs.values('id', 'reporter_id', 'report_type', 'title', 'status', 'created_at')
        except Exception:
            return []

    # fallback empty
    return []


def _stream_csv(rows, fieldnames):
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow({k: r.get(k, '') for k in fieldnames})
    buffer.seek(0)
    return StreamingHttpResponse(buffer, content_type='text/csv')


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPlatformAdmin])
def generate_report(request):
    data = request.data
    definition_id = data.get('definition')
    params = data.get('params', {}) or {}

    try:
        definition = ReportDefinition.objects.get(pk=definition_id) if definition_id else None
    except ReportDefinition.DoesNotExist:
        return Response({'error': 'Report definition not found.'}, status=status.HTTP_404_NOT_FOUND)

    if definition and not definition.allow_custom_params and params:
        return Response({'error': 'Custom params not allowed for this report.'}, status=status.HTTP_400_BAD_REQUEST)

    # create GeneratedReport record
    gen = GeneratedReport.objects.create(definition=definition, requested_by=request.user, params=params, status='processing')

    # run synchronous generation (for now)
    try:
        rows = _query_for_report(definition.report_type, params)
        rows_list = list(rows)
        fieldnames = list(rows_list[0].keys()) if rows_list else []

        # build CSV into memory and attach to GeneratedReport
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames)
        if fieldnames:
            writer.writeheader()
            for r in rows_list:
                writer.writerow(r)

        csv_buffer.seek(0)
        filename = f"report-{slugify(definition.slug)}-{gen.pk}.csv" if definition else f"report-custom-{gen.pk}.csv"
        gen.row_count = len(rows_list)
        # save file to FileField
        from django.core.files.base import ContentFile
        gen.file.save(filename, ContentFile(csv_buffer.getvalue().encode('utf-8')))
        gen.status = 'completed'
        gen.save()

        # audit log
        from .models import ReportAccessLog
        ReportAccessLog.objects.create(report=gen, user=request.user, action='generate', ip_address=request.META.get('REMOTE_ADDR', ''))

        return Response(GeneratedReportSerializer(gen).data, status=status.HTTP_201_CREATED)
    except Exception as exc:
        gen.status = 'failed'
        gen.error = str(exc)
        gen.save()
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPlatformAdmin])
def download_report_file(request, pk):
    try:
        gen = GeneratedReport.objects.get(pk=pk)
    except GeneratedReport.DoesNotExist:
        return Response({'error': 'GeneratedReport not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not gen.file:
        return Response({'error': 'No file available for this report.'}, status=status.HTTP_400_BAD_REQUEST)

    # log access
    from .models import ReportAccessLog
    ReportAccessLog.objects.create(report=gen, user=request.user, action='download', ip_address=request.META.get('REMOTE_ADDR', ''))

    response = HttpResponse(gen.file, content_type='application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="{gen.file.name.split("/")[-1]}"'
    return response