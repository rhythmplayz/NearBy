# Celery task placeholders - requires Celery to be configured in the project
from celery import shared_task
from .models import ReportDefinition, GeneratedReport
import io
import csv
from django.utils.text import slugify
from django.core.files.base import ContentFile
from django.utils import timezone

@shared_task
def generate_report_task(definition_id, params=None, requested_by_id=None):
    try:
        definition = ReportDefinition.objects.get(pk=definition_id)
    except ReportDefinition.DoesNotExist:
        return {'error': 'definition not found'}

    gen = GeneratedReport.objects.create(definition=definition, params=params or {}, status='processing')
    try:
        rows = []
        if definition.report_type == 'user_activity':
            from users.models import User
            qs = User.objects.all()
            rows = list(qs.values('id','username','email','full_name','user_type','status','date_joined','last_login'))

        fieldnames = list(rows[0].keys()) if rows else []
        buffer = io.StringIO()
        if fieldnames:
            writer = csv.DictWriter(buffer, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow(r)
        buffer.seek(0)
        filename = f"report-{slugify(definition.slug)}-{gen.pk}.csv"
        gen.row_count = len(rows)
        gen.file.save(filename, ContentFile(buffer.getvalue().encode('utf-8')))
        gen.status = 'completed'
        gen.completed_at = timezone.now()
        gen.save()
        return {'id': gen.pk, 'row_count': gen.row_count}
    except Exception as exc:
        gen.status = 'failed'
        gen.error = str(exc)
        gen.save()
        return {'error': str(exc)}
