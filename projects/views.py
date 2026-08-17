from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from django.db.models import Count, Q

from .models import Project
from .permissions import ProjectPermission
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer

    permission_classes = [ProjectPermission]

    def get_queryset(self):
        return (
            Project.objects.all()
            .annotate(
                tasks_total=Count("tasks", distinct=True),
                tasks_done=Count(
                    "tasks", filter=Q(tasks__status="DONE"), distinct=True
                ),
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)