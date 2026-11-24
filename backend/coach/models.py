from django.db import models
from django.contrib.auth.models import User


class CoachActionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_logs')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    message = models.TextField()
    intent = models.CharField(max_length=50, blank=True, null=True)
    confidence = models.FloatField(default=1.0)
    action_type = models.CharField(max_length=50, blank=True, null=True)
    rationale = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.created_at.strftime('%H:%M:%S')}): {self.message[:30]}"
