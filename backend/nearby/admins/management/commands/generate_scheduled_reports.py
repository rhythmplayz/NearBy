from django.core.management.base import BaseCommand
from admins.models import ReportDefinition, GeneratedReport, ReportAccessLog
import io
import csv
from django.utils.text import slugify
from django.core.files.base import ContentFile
from django.utils import timezone

class Command(BaseCommand):
    help = 'Generate scheduled reports based on ReportDefinition.schedule'

    def handle(self, *args, **options):
        defs = ReportDefinition.objects.filter(schedule__isnull=False).exclude(schedule__exact='')
        self.stdout.write(f'Found {defs.count()} scheduled report definitions')
        for d in defs:
            self.stdout.write(f'Generating report for definition: {d.name} ({d.report_type})')
            gen = GeneratedReport.objects.create(definition=d, status='processing')
            try:
                # simple param handling: use default_params
                params = d.default_params or {}
                # Map types to simple querysets
                rows = []
                if d.report_type == 'user_activity':
                    from users.models import User
                    qs = User.objects.all()
                    rows = list(qs.values('id','username','email','full_name','user_type','status','date_joined','last_login'))
                elif d.report_type == 'seller_performance':
                    from sellers.models import Seller
                    qs = Seller.objects.all()
                    rows = list(qs.values('id','business_name','full_name','rating','verification_status','created_at'))

                fieldnames = list(rows[0].keys()) if rows else []
                buffer = io.StringIO()
                if fieldnames:
                    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
                    writer.writeheader()
                    for r in rows:
                        writer.writerow(r)
                buffer.seek(0)
                filename = f"report-{slugify(d.slug)}-{gen.pk}.csv"
                gen.row_count = len(rows)
                gen.file.save(filename, ContentFile(buffer.getvalue().encode('utf-8')))
                gen.status = 'completed'
                gen.completed_at = timezone.now()
                gen.save()
                self.stdout.write(self.style.SUCCESS(f'Generated report {gen.pk}, rows={gen.row_count}'))
            except Exception as exc:
                gen.status = 'failed'
                gen.error = str(exc)
                gen.save()
                self.stderr.write(self.style.ERROR(f'Failed to generate: {exc}'))
