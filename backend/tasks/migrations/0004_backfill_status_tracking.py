from django.db import migrations


def backfill(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    TaskStatusHistory = apps.get_model('tasks', 'TaskStatusHistory')

    for task in Task.objects.all():

        # Best available proxy for pre-existing rows: `updated_at` isn't
        # perfectly reliable (see the model docstring/comments), but it's
        # strictly better than leaving these null forever. Anything created
        # from this migration forward gets accurate started_at/completed_at
        # from Task.save().
        if task.status in ("IN_PROGRESS", "REVIEW", "DONE") and not task.started_at:
            task.started_at = task.updated_at

        if task.status == "DONE" and not task.completed_at:
            task.completed_at = task.updated_at

        task.save(update_fields=["started_at", "completed_at"])

        if not task.status_history.exists():
            history_row = TaskStatusHistory.objects.create(
                task=task,
                from_status=None,
                to_status=task.status,
            )
            # auto_now_add ignores a value passed at creation time, so
            # backdate it with a direct update instead.
            TaskStatusHistory.objects.filter(pk=history_row.pk).update(
                changed_at=task.created_at
            )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0003_task_status_tracking'),
    ]

    operations = [
        migrations.RunPython(backfill, noop),
    ]
