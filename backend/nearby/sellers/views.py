from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.views import APIView

from .serializers import SellerRegistrationSerializer, SellerTokenObtainPairSerializer, SellerProfileSerializer


class SellerTokenObtainPairView(TokenObtainPairView):
    serializer_class = SellerTokenObtainPairSerializer

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
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'seller':
            return Response({'detail': 'Seller access required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = SellerProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        if getattr(request.user, 'user_type', None) != 'seller':
            return Response({'detail': 'Seller access required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = SellerProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)