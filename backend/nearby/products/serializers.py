from django.db import transaction
from rest_framework import serializers

from sellers.models import Seller
from .models import Product, ProductCategory, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    category_name = serializers.CharField(write_only=True)
    category = serializers.CharField(source='category.name', read_only=True)
    images = serializers.SerializerMethodField()
    image_files = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    is_in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'seller',
            'seller_name',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'stock',
            'is_active',
            'is_in_stock',
            'images',
            'image_files',
            'created_at',
            'updated_at',
            'deleted_at',
        ]
        read_only_fields = ['id', 'seller', 'seller_name', 'category', 'images', 'is_in_stock', 'created_at', 'updated_at', 'deleted_at']

    def get_images(self, obj):
        request = self.context.get('request')
        return ProductImageSerializer(obj.images.all(), many=True, context={'request': request}).data

    def get_is_in_stock(self, obj):
        return obj.is_in_stock

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Name is required.')
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Description is required.')
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value

    def _resolve_category(self, category_name):
        cleaned_name = category_name.strip()
        if not cleaned_name:
            raise serializers.ValidationError({'category_name': 'Category is required.'})
        category, _ = ProductCategory.objects.get_or_create(name=cleaned_name)
        return category

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        seller = Seller.objects.get(id=request.user.id)
        category_name = validated_data.pop('category_name')
        image_files = validated_data.pop('image_files', [])
        category = self._resolve_category(category_name)
        product = Product.objects.create(seller=seller, category=category, **validated_data)
        for image_file in image_files:
            ProductImage.objects.create(product=product, image=image_file)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        category_name = validated_data.pop('category_name', None)
        image_files = validated_data.pop('image_files', [])

        if category_name is not None:
            instance.category = self._resolve_category(category_name)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if image_files:
            ProductImage.objects.filter(product=instance).delete()
            for image_file in image_files:
                ProductImage.objects.create(product=instance, image=image_file)

        return instance
