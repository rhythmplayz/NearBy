from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Post
from .serializers import PostSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_posts(request):
    if request.method == 'GET':
        # List all active posts
        posts = Post.objects.filter(status='active').order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        # Create a new post
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(
                author=request.user,
                created_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)

    # Permission check: Only the author can edit or delete
    if request.method in ['PUT', 'PATCH', 'DELETE'] and post.author != request.user:
        return Response({"error": "You do not have permission to modify this post."}, 
                        status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = PostSerializer(post, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Soft delete as per previous logic
        post.status = 'deleted'
        post.updated_by = request.user
        post.save()
        return Response({"message": "Post deleted successfully"}, status=status.HTTP_204_NO_CONTENT)