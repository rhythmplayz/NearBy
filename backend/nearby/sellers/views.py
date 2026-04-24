from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import SellerRegistrationSerializer

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