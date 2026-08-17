from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    manager_name = serializers.CharField(
        source="manager.username",
        read_only=True,
    )

    tasks_total = serializers.SerializerMethodField()
    tasks_done = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:

        model = Project

        fields = "__all__"
        read_only_fields = ["manager"]

    def get_tasks_total(self, obj):
        total = getattr(obj, "tasks_total", None)

        if total is None:
            total = obj.tasks.count()

        return total

    def get_tasks_done(self, obj):
        done = getattr(obj, "tasks_done", None)

        if done is None:
            done = obj.tasks.filter(status="DONE").count()

        return done

    def get_progress(self, obj):
        total = self.get_tasks_total(obj)

        if not total:
            return 0

        done = self.get_tasks_done(obj)

        return round((done / total) * 100)