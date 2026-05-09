from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Seller
from .serializers import SellerProfileSerializer, SellerRegistrationSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_seller(request):
    serializer = SellerRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "Seller registered successfully",
            "user_id": user.id,
            "username": user.username,
            "business_name": user.business_name
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerProfileView(APIView):
    """
    View to get or update the profile of the logged-in seller.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # FIX: Explicitly get the Seller instance using the base user's ID
            seller = Seller.objects.get(id=request.user.id)
            serializer = SellerProfileSerializer(seller, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Seller.DoesNotExist:
            return Response({"error": "Seller profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            seller = Seller.objects.get(id=request.user.id)
            # partial=True allows sellers to update specific fields
            serializer = SellerProfileSerializer(
                seller, 
                data=request.data, 
                partial=True, 
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Profile updated successfully!",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Seller.DoesNotExist:
            return Response({"error": "Seller profile not found"}, status=status.HTTP_404_NOT_FOUND)