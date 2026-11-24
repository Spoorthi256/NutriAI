from django.db import models
from django.contrib.auth.models import User


class NutritionProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('neutral', 'Neutral'),
    ]

    GOAL_CHOICES = [
        ('muscle_gain', 'Muscle Gain'),
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
        ('maintenance', 'Maintenance'),
    ]

    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('light', 'Lightly Active'),
        ('moderate', 'Moderately Active'),
        ('very_active', 'Very Active'),
        ('extra_active', 'Extra Active'),
    ]

    DIET_CHOICES = [
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('keto', 'Keto'),
        ('mediterranean', 'Mediterranean'),
        ('non_vegetarian', 'Non-Vegetarian'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nutrition_profile')
    age = models.IntegerField(default=22)
    height_cm = models.FloatField(default=178.0)
    weight_kg = models.FloatField(default=87.0)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True, default='male')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='muscle_gain')
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='moderate')
    diet_type = models.CharField(max_length=20, choices=DIET_CHOICES, default='vegetarian')
    meals_per_day = models.IntegerField(default=4)
    training_days = models.IntegerField(default=5)

    # Calculated Output Targets
    daily_calories = models.IntegerField(default=2500)
    protein_grams = models.IntegerField(default=150)
    carbs_grams = models.IntegerField(default=300)
    fat_grams = models.IntegerField(default=70)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Nutrition Profile ({self.user.username}) - {self.daily_calories} kcal"


class Allergy(models.Model):
    profile = models.ForeignKey(NutritionProfile, on_delete=models.CASCADE, related_name='allergies_rel')
    ingredient = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Allergies'
        unique_together = ('profile', 'ingredient')

    def __str__(self):
        return f"{self.profile.user.username} - Allergy: {self.ingredient}"


class DislikedFood(models.Model):
    profile = models.ForeignKey(NutritionProfile, on_delete=models.CASCADE, related_name='dislikes_rel')
    ingredient = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'ingredient')

    def __str__(self):
        return f"{self.profile.user.username} - Dislike: {self.ingredient}"
