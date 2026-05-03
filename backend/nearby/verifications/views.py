from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from sellers.models import Seller
from .models import SellerVerification
from .serializers import SellerVerificationSubmitSerializer, AdminSellerVerificationSerializer
from admins.models import Admin


# --- SELLER ENDPOINT ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def submit_seller_verification(request):
    try:
        seller = Seller.objects.get(id=request.user.id)
    except Seller.DoesNotExist:
        return Response({
            "error": "Access denied. Only registered sellers can access verification services."
        }, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        verifications = SellerVerification.objects.filter(seller=seller).order_by('-created_at')
        serializer = SellerVerificationSubmitSerializer(verifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        if SellerVerification.objects.filter(seller=seller, verification_status='pending').exists():
            return Response({
                "error": "You already have a verification request pending review."
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = SellerVerificationSubmitSerializer(
            data=request.data, 
            context={'request': request}
        )

        if serializer.is_valid():
            verification = serializer.save(
                seller=seller,
                created_by=request.user,
                updated_by=request.user,
                status='active',
                verification_status='pending'
            )

            seller.verification_status = 'pending'
            seller.save()

            return Response({
                "message": "Verification documents submitted successfully",
                "verification_id": verification.id,
                "status": verification.verification_status,
                "business_name": seller.business_name
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# --- ADMIN ENDPOINTS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_verifications(request):
    if not Admin.objects.filter(id=request.user.id).exists():
        return Response({
            "error": "Access denied. Administrative privileges required."
        }, status=status.HTTP_403_FORBIDDEN)

    verifications = SellerVerification.objects.all().order_by('-created_at')
    serializer = AdminSellerVerificationSerializer(verifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_review_verification(request, pk):
    if not Admin.objects.filter(id=request.user.id).exists():
        return Response({
            "error": "Access denied. Administrative privileges required."
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        verification = SellerVerification.objects.get(pk=pk)
    except SellerVerification.DoesNotExist:
        return Response({"error": "Verification request not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdminSellerVerificationSerializer(verification, data=request.data, partial=True)
    
    if serializer.is_valid():
        updated_verification = serializer.save(updated_by=request.user)

        seller = updated_verification.seller
        seller.verification_status = updated_verification.verification_status
        seller.save()

        return Response({
            "message": f"Verification status updated to {updated_verification.verification_status}",
            "seller": seller.business_name,
            "status": updated_verification.verification_status
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)