from rest_framework_simplejwt.views import TokenObtainPairView

from admins.models import Admin
from .serializers import AdminProfileSerializer, AdminTokenObtainPairSerializer
from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminRegistrationSerializer
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
    """
    View to get or update the profile of the logged-in administrator.
    """
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        try:
            # Fetch the Admin instance specifically
            admin = Admin.objects.get(id=request.user.id)
            serializer = AdminProfileSerializer(admin, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Admin.DoesNotExist:
            return Response({"error": "Admin profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            admin = Admin.objects.get(id=request.user.id)
            # Use partial=True to allow updating specific fields like phone or profile_pic
            serializer = AdminProfileSerializer(
                admin, 
                data=request.data, 
                partial=True, 
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Admin profile updated successfully!",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Admin.DoesNotExist:
            return Response({"error": "Admin profile not found"}, status=status.HTTP_404_NOT_FOUND)