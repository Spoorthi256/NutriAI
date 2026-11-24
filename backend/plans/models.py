from django.db import models
from django.contrib.auth.models import User
from backend.meals.models import Meal


class MealPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    daily_calories = models.IntegerField()
    protein_grams = models.IntegerField()
    carbs_grams = models.IntegerField()
    fat_grams = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"MealPlan ({self.user.username}) - {self.created_at.strftime('%Y-%m-%d')}"


class MealPlanItem(models.Model):
    plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name='items')
    day = models.CharField(max_length=20)  # e.g., 'Monday'
    slot = models.CharField(max_length=20)  # e.g., 'breakfast', 'snack_1'
    slot_display = models.CharField(max_length=50)  # e.g., 'Breakfast', 'Snack 1'
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    is_user_locked = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.plan.user.username} - {self.day} {self.slot_display}: {self.meal.name}"
