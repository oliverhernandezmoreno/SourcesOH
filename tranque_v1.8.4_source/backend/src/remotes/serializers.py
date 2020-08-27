from rest_framework import serializers

from remotes.models import Message


class MessageSerializer(serializers.Serializer):

    id = serializers.CharField()
    response_to = serializers.CharField(required=False, allow_null=True)
    command = serializers.CharField()
    body = serializers.DictField()
    extra = serializers.DictField(required=False, allow_null=True)  # not-persisted data
    origin = serializers.CharField()
    created_at = serializers.DateTimeField()

    def validate_response_to(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if not Message.objects.filter(id=value).exists():
            return None
        return value

    def create(self, validated_data):
        data = {**validated_data, "exchange": self.context["exchange"]}
        response_to = data.pop("response_to", None)
        id = data.pop("id")
        extra = data.pop("extra", None)
        message, _ = Message.objects.update_or_create(id=id, defaults=data)
        if response_to is not None:
            message.response.add(Message.objects.filter(id=response_to).first())
        message.extra = extra or {}
        return message

    @staticmethod
    def serialize_message(message):
        serializer = MessageSerializer(message)
        response_to = message.request.first()
        return {
            **serializer.data,
            "extra": getattr(message, "extra", None) or {},
            "response_to": response_to.id
            if response_to is not None
            else None,
        }
