from django.contrib import admin

from .models import Rider, RiderReport, RiderReportAttachment


admin.site.register(Rider)
admin.site.register(RiderReport)
admin.site.register(RiderReportAttachment)
