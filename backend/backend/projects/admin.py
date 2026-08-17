from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "manager",
        "status",
        "start_date",
        "due_date",
    )

    list_filter = (
        "status",
        "manager",
    )

    search_fields = (
        "name",
        "description",
    )
# Register your models here.
