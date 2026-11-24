from rest_framework import serializers
from backend.coach.models import CoachActionLog


class CoachActionLogSerializer(serializers.ModelSerializer):
    actionType = serializers.CharField(source='action_type', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = CoachActionLog
        fields = ['id', 'role', 'message', 'intent', 'confidence', 'actionType', 'rationale', 'createdAt']
