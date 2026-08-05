from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone
from projects.models import Project


class Task(models.Model):

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        TODO = "TODO", "To Do"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        REVIEW = "REVIEW", "Review"
        DONE = "DONE", "Done"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_tasks"
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )

    due_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Set automatically (see save()) the first time a task moves to
    # IN_PROGRESS / DONE. These exist specifically so reporting doesn't have
    # to rely on `updated_at`, which changes on *any* save (a comment, a
    # reassignment, a priority edit) and is therefore not a trustworthy
    # stand-in for "when did this actually get done".
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):

        is_new = self._state.adding
        old_status = None

        if not is_new:
            old_status = (
                Task.objects.filter(pk=self.pk)
                .values_list("status", flat=True)
                .first()
            )

        status_changed = is_new or old_status != self.status

        if status_changed:

            now = timezone.now()

            if self.status == self.Status.IN_PROGRESS and not self.started_at:
                self.started_at = now

            if self.status == self.Status.DONE:
                self.completed_at = now
            elif old_status == self.Status.DONE and self.status != self.Status.DONE:
                # Reopened - it's no longer "done", so it shouldn't still
                # count as completed for cycle-time / on-time reporting.
                self.completed_at = None

        super().save(*args, **kwargs)

        if status_changed:
            TaskStatusHistory.objects.create(
                task=self,
                from_status=old_status,
                to_status=self.status,
            )


class TaskStatusHistory(models.Model):
    """
    One row per status transition. This is what makes real flow metrics
    (cycle time, time-in-status, reopen rate) possible - without it, the
    only signal available is `updated_at`, which is too easily disturbed
    by unrelated edits to be trusted for reporting.
    """

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    from_status = models.CharField(
        max_length=20,
        choices=Task.Status.choices,
        null=True,
        blank=True,
    )

    to_status = models.CharField(
        max_length=20,
        choices=Task.Status.choices,
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]

    def __str__(self):
        return f"{self.task_id}: {self.from_status} -> {self.to_status}"