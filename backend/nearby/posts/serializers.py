from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    author_full_name = serializers.ReadOnlyField(source='author.full_name')
    author_profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'description', 'cover_pic', 
            'post_type', 'author', 'author_username', 
            'author_full_name', 'author_profile_pic',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'status', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def get_author_profile_pic(self, obj):
        if obj.author.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile_pic.url)
        return None