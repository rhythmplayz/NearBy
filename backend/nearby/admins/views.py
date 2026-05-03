from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import AdminTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminRegistrationSerializer, AdminProfileSerializer
from .permissions import IsPlatformAdmin


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPlatformAdmin])
def register_admin(request):
    if request.user.user_type != 'admin':
        return Response(
            {"error": "Access denied. Only administrators can register other admins."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = AdminRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Admin account created successfully.", "user": serializer.data['username']},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = AdminProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = AdminProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)