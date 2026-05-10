from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from sellers.models import Seller
from .models import Product, ProductCategory


class ProductAPITests(APITestCase):
    def setUp(self):
        self.seller = Seller.objects.create_user(
            username='seller_one',
            password='pass12345',
            email='seller1@example.com',
            full_name='Seller One',
            phone='1234567890',
            address='Address 1',
            business_name='Shop One',
            user_type='seller',
        )
        self.other_seller = Seller.objects.create_user(
            username='seller_two',
            password='pass12345',
            email='seller2@example.com',
            full_name='Seller Two',
            phone='0987654321',
            address='Address 2',
            business_name='Shop Two',
            user_type='seller',
        )

    def test_seller_can_create_and_list_products(self):
        self.client.force_authenticate(user=self.seller)
        image = SimpleUploadedFile('product.png', b'fake-image-content', content_type='image/png')

        response = self.client.post(
            '/api/products/seller/',
            {
                'name': 'Fresh Apples',
                'description': 'Crisp and local.',
                'price': '12.50',
                'category_name': 'Groceries',
                'stock': 7,
                'image_files': [image],
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(response.data['data']['category'], 'Groceries')
        self.assertEqual(len(response.data['data']['images']), 1)

        list_response = self.client.get('/api/products/seller/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data['count'], 1)
        self.assertEqual(list_response.data['results'][0]['name'], 'Fresh Apples')

    def test_validation_rejects_invalid_price(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.post(
            '/api/products/seller/',
            {
                'name': 'Bad Product',
                'description': 'Invalid price.',
                'price': '0',
                'category_name': 'Test',
                'stock': 1,
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('price', response.data)

    def test_owner_only_can_update_and_delete(self):
        category = ProductCategory.objects.create(name='Sample Category')
        product = Product.objects.create(
            seller=self.seller,
            category=category,
            name='Sample',
            description='Sample product',
            price=Decimal('5.00'),
            stock=1,
        )

        self.client.force_authenticate(user=self.other_seller)
        update_response = self.client.patch(
            f'/api/products/{product.id}/',
            {'name': 'Hacked'},
            format='multipart',
        )
        self.assertEqual(update_response.status_code, 404)

        self.client.force_authenticate(user=self.seller)
        delete_response = self.client.delete(f'/api/products/{product.id}/')
        self.assertEqual(delete_response.status_code, 200)
        product.refresh_from_db()
        self.assertIsNotNone(product.deleted_at)
