from rest_framework import permissions


class ProjectPermission(permissions.BasePermission):
    """
    Every authenticated user can see every project - visibility isn't
    limited to whoever happens to be a member.
    Managers can create projects, and can only edit or delete the
    projects they themselves manage.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if view.action == "create":
            return user.role == "MANAGER"

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if view.action in ("update", "partial_update", "destroy"):
            return user.role == "MANAGER" and obj.manager_id == user.id

        return True
