from rest_framework import serializers
from .models import SellerVerification
from sellers.models import Seller

class SellerVerificationSubmitSerializer(serializers.ModelSerializer):

    id_proof = serializers.FileField(required=True)

    business_license = serializers.FileField(required=True)



    class Meta:

        model = SellerVerification

        fields = [

            'id',

            'id_proof',

            'business_license',

            'verification_status',

            'status',

            'created_at',

            'updated_at',

            'created_by',

            'updated_by'

        ]


        read_only_fields = [

            'id',

            'verification_status',

            'status',

            'created_at',

            'updated_at',

            'created_by',

            'updated_by'

        ]



    def validate(self, attrs):

        user = self.context['request'].user


        existing_request = SellerVerification.objects.filter(created_by=user).first()

       

        if existing_request:

            if existing_request.verification_status == 'pending':

                raise serializers.ValidationError("You already have a pending verification request.")

            if existing_request.verification_status == 'verified':

                raise serializers.ValidationError("Your account is already verified.")

       

        return attrs



    def create(self, validated_data):

        user = self.context.get('request').user


        try:

            seller_instance = Seller.objects.get(id=user.id)

        except Seller.DoesNotExist:

            raise serializers.ValidationError("User is not registered as a seller.")


        validated_data['seller'] = seller_instance

        validated_data['created_by'] = user

        validated_data['updated_by'] = user

        validated_data['status'] = 'active'

        validated_data['verification_status'] = 'pending'

       

        return super().create(validated_data)


class AdminSellerVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the admin end to view and review verification requests.
    """
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    
    class Meta:
        model = SellerVerification
        fields = [
            'id',
            'seller',
            'seller_name',
            'seller_email',
            'id_proof',
            'business_license',
            'verification_status',
            'status',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by'
        ]

        read_only_fields = [
            'id',
            'seller',
            'seller_name',
            'seller_email',
            'id_proof',
            'business_license',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by'
        ]

        def get_id_proof(self, obj):
            if obj.id_proof:
                return self.context['request'].build_absolute_uri(obj.id_proof.url)
            return None

        def get_business_license(self, obj):
            if obj.business_license:
                return self.context['request'].build_absolute_uri(obj.business_license.url)
            return None