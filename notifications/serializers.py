from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    actor_name = serializers.CharField(
        source="actor.username",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "message",
            "link",
            "notification_type",
            "is_read",
            "created_at",
            "actor_name",
        ]
        read_only_fields = fields
