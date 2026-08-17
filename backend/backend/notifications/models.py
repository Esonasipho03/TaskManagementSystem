from django.db import models
from django.conf import settings


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        TASK_ASSIGNED = "TASK_ASSIGNED", "Task assigned"
        TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED", "Task status changed"
        PROJECT_ADDED = "PROJECT_ADDED", "Added to project"
        PROJECT_CREATED = "PROJECT_CREATED", "Project created"
        GENERAL = "GENERAL", "General"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="triggered_notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )

    message = models.CharField(max_length=255)

    # Frontend route the notification should deep-link to, e.g. "/tasks"
    link = models.CharField(max_length=255, blank=True)

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient} - {self.message}"
