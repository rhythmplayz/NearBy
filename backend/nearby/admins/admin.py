from django.contrib import admin

from .models import Admin, ReportDefinition, GeneratedReport, ReportAccessLog


admin.site.register(Admin)
admin.site.register(ReportDefinition)
admin.site.register(GeneratedReport)
admin.site.register(ReportAccessLog)
