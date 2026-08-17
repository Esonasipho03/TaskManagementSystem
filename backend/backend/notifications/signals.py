from django.db.models.signals import pre_save, post_save, m2m_changed
from django.dispatch import receiver

from tasks.models import Task
from projects.models import Project

from .models import Notification


@receiver(pre_save, sender=Task)
def stash_previous_task_state(sender, instance, **kwargs):
    """Remember the task's previous status/assignee so post_save can tell
    what actually changed."""

    if not instance.pk:
        instance._previous_status = None
        instance._previous_assignee_id = None
        return

    try:
        previous = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        instance._previous_status = None
        instance._previous_assignee_id = None
    else:
        instance._previous_status = previous.status
        instance._previous_assignee_id = previous.assigned_to_id


@receiver(post_save, sender=Task)
def notify_task_changes(sender, instance, created, **kwargs):

    manager_id = instance.project.manager_id

    if created:

        # Let the project manager know new work was carved out, unless
        # they were the one who somehow triggered it.
        if manager_id and manager_id != instance.created_by_id:
            Notification.objects.create(
                recipient_id=manager_id,
                actor=instance.created_by,
                notification_type=Notification.NotificationType.TASK_ASSIGNED,
                message=f'{instance.created_by} added a new task "{instance.title}" to "{instance.project.name}"',
                link="/tasks",
            )

        # Let a teammate know they've just been handed a task.
        if instance.assigned_to_id and instance.assigned_to_id != instance.created_by_id:
            Notification.objects.create(
                recipient_id=instance.assigned_to_id,
                actor=instance.created_by,
                notification_type=Notification.NotificationType.TASK_ASSIGNED,
                message=f'{instance.created_by} assigned you to "{instance.title}"',
                link="/tasks",
            )

        return

    previous_status = getattr(instance, "_previous_status", None)
    previous_assignee_id = getattr(instance, "_previous_assignee_id", None)

    # Reassigned to someone new
    if (
        instance.assigned_to_id
        and instance.assigned_to_id != previous_assignee_id
        and instance.assigned_to_id != instance.created_by_id
    ):
        Notification.objects.create(
            recipient_id=instance.assigned_to_id,
            actor=instance.created_by,
            notification_type=Notification.NotificationType.TASK_ASSIGNED,
            message=f'You were assigned to "{instance.title}"',
            link="/tasks",
        )

    # Wrapped up: let the manager know
    if (
        previous_status is not None
        and previous_status != instance.status
        and instance.status == Task.Status.DONE
        and manager_id
        and manager_id != instance.assigned_to_id
    ):
        Notification.objects.create(
            recipient_id=manager_id,
            actor=instance.assigned_to,
            notification_type=Notification.NotificationType.TASK_STATUS_CHANGED,
            message=f'"{instance.title}" was marked done in "{instance.project.name}"',
            link="/tasks",
        )


@receiver(m2m_changed, sender=Project.members.through)
def notify_project_members_added(sender, instance, action, pk_set, **kwargs):
    """Notify developers when they're added as members of a project."""

    if action != "post_add" or not pk_set:
        return

    for user_id in pk_set:
        if user_id == instance.manager_id:
            continue

        Notification.objects.create(
            recipient_id=user_id,
            actor=instance.manager,
            notification_type=Notification.NotificationType.PROJECT_ADDED,
            message=f'You were added to project "{instance.name}"',
            link="/projects",
        )
