from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from common_auth_user.models import AuthUser
from riders.models import Rider, RiderSupportReport


def create_rider(username='rider1', user_type='rider', full_name='Rider One'):
	return Rider.objects.create_user(
		username=username,
		password='testpass123',
		email=f'{username}@example.com',
		full_name=full_name,
		phone='1234567890',
		address='Test Address',
		user_type=user_type,
		created_by=None,
		updated_by=None,
		vehicle_type='Bike',
		license_number='LIC-001',
	)


def create_admin(username='admin1', full_name='Admin One'):
	return AuthUser.objects.create_user(
		username=username,
		password='testpass123',
		email=f'{username}@example.com',
		full_name=full_name,
		phone='1234567890',
		address='Test Address',
		user_type='admin',
		created_by=None,
		updated_by=None,
	)


class RiderSupportReportTests(APITestCase):
	def setUp(self):
		self.rider = create_rider()
		self.admin = create_admin()
		self.report_url = reverse('rider_support_reports')
		self.admin_reports_url = reverse('admin_rider_reports')
		self.analytics_url = reverse('admin_rider_reports_analytics')

	def authenticate(self, user):
		self.client.force_authenticate(user=user)

	def test_rider_can_submit_support_report(self):
		self.authenticate(self.rider)

		response = self.client.post(
			self.report_url,
			{
				'report_type': 'complaint',
				'subject': 'Delayed pickup',
				'description': 'The pickup time was delayed by 30 minutes.',
				'location': 'Downtown',
			},
			format='multipart',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(RiderSupportReport.objects.count(), 1)
		self.assertEqual(response.data['report']['status'], 'pending')

	def test_rider_can_only_see_own_reports(self):
		RiderSupportReport.objects.create(
			rider=self.rider,
			report_type='feedback',
			subject='Great service',
			description='Thanks for the quick support.',
		)
		other_rider = create_rider(username='rider2', full_name='Rider Two')
		RiderSupportReport.objects.create(
			rider=other_rider,
			report_type='inquiry',
			subject='Route question',
			description='Need clarification on route handling.',
		)

		self.authenticate(self.rider)
		response = self.client.get(self.report_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['subject'], 'Great service')

	def test_admin_can_update_status_and_view_analytics(self):
		report = RiderSupportReport.objects.create(
			rider=self.rider,
			report_type='safety_concern',
			subject='Unsafe road condition',
			description='The road near the stop has a pothole.',
		)

		self.authenticate(self.admin)
		update_url = reverse('admin_rider_report_status', args=[report.id])
		response = self.client.patch(
			update_url,
			{
				'status': 'resolved',
				'admin_response': 'This has been forwarded to operations and resolved.',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		report.refresh_from_db()
		self.assertEqual(report.status, 'resolved')
		self.assertIsNotNone(report.responded_at)
		self.assertIsNotNone(report.resolved_at)

		analytics_response = self.client.get(self.analytics_url)
		self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
		self.assertEqual(analytics_response.data['summary']['total_reports'], 1)

	def test_admin_can_list_all_reports(self):
		RiderSupportReport.objects.create(
			rider=self.rider,
			report_type='app_issue',
			subject='App crash',
			description='The app closes after login.',
		)

		self.authenticate(self.admin)
		response = self.client.get(self.admin_reports_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
