from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


class OrdersAPITests(APITestCase):
    def setUp(self):
        # create a minimal valid user for this project (custom user requires extra fields)
        self.user = User.objects.create_user(
            username='testuser',
            email='user@example.com',
            password='pass',
            user_type='user',
            full_name='Test User',
            phone='1234567890',
            address='123 Test St'
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_create_order(self):
        url = reverse('orders-list')
        payload = {
            'pickup_address': '123 A St',
            'dropoff_address': '456 B Ave',
            'items': [
                {'name': 'Box', 'quantity': 1}
            ]
        }
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['pickup_address'], '123 A St')
