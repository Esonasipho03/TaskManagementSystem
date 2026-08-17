from rest_framework import serializers
from .models import Task, TaskStatusHistory


class TaskStatusHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = TaskStatusHistory
        fields = ["id", "from_status", "to_status", "changed_at"]


class TaskSerializer(serializers.ModelSerializer):

    assigned_to_name = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    # Read-only: these are set automatically by Task.save() off of real
    # status transitions, not something a client should be able to fake.
    status_history = TaskStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        # Whoever breaks the work down is recorded as the creator - that
        # can't be reassigned - but who the task is *assigned to* is a
        # normal, editable field so teammates can hand work to each other.
        # started_at/completed_at are derived from status transitions in
        # Task.save(), not client input.
        read_only_fields = ["created_by", "started_at", "completed_at"]

    def validate(self, attrs):
        # Membership checks removed - any developer can set a task's
        # project or assignee to whatever they choose.
        return attrs
