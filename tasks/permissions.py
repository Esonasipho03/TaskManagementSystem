from rest_framework import permissions


class TaskPermission(permissions.BasePermission):
    """
    Developers create, edit, and delete tasks - breaking projects down into
    work items and handing them out across the team. Managers get
    read-only access across every task, for oversight.

    Editing a task is open to any developer, regardless of project
    membership; deleting stays limited to the creator.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if view.action in ("create", "update", "partial_update", "destroy"):
            return user.role == "DEVELOPER"

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if view.action == "destroy":
            return user == obj.created_by

        return True
