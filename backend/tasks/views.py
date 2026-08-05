from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .models import Task
from .permissions import TaskPermission
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [TaskPermission]

    def get_queryset(self):
        # No membership restriction - every developer sees every task,
        # same as managers.
        return Task.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        # Default to self-assigned if nobody else was picked in the form.
        assigned_to = serializer.validated_data.get("assigned_to") or self.request.user
        serializer.save(created_by=self.request.user, assigned_to=assigned_to)
