from django.contrib import admin

from riders.models import Rider, RiderSupportReport


admin.site.register(Rider)


@admin.register(RiderSupportReport)
class RiderSupportReportAdmin(admin.ModelAdmin):
	list_display = ('id', 'rider', 'report_type', 'status', 'submitted_at', 'updated_at')
	list_filter = ('report_type', 'status', 'submitted_at')
	search_fields = ('subject', 'description', 'rider__username', 'rider__full_name')
	readonly_fields = ('submitted_at', 'updated_at', 'responded_at', 'resolved_at')
