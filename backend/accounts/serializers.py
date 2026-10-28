from datetime import timedelta

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
        ]
        read_only_fields = ["role", "username"]
# How long a login lasts when "Keep me logged in" is ticked vs. not.
REMEMBER_ME_LIFETIME = timedelta(days=30)
DEFAULT_SESSION_LIFETIME = timedelta(hours=12)


class RememberMeTokenSerializer(TokenObtainPairSerializer):
    """Login serializer that accepts an optional `remember_me` flag.

    With remember_me the refresh token lasts 30 days, so the device stays
    signed in. Without it the refresh token expires after 12 hours.
    """

    remember_me = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        remember_me = attrs.pop("remember_me", False)
        data = super().validate(attrs)

        refresh = self.get_token(self.user)
        refresh.set_exp(
            lifetime=REMEMBER_ME_LIFETIME if remember_me else DEFAULT_SESSION_LIFETIME
        )
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["remember_me"] = remember_me
        return data
