from django.db import models


class Meal(models.Model):
    CATEGORY_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    meal_type = models.CharField(max_length=100)
    diet_types = models.JSONField(default=list)
    ingredients = models.JSONField(default=list)
    calories = models.IntegerField()
    protein = models.IntegerField()
    carbs = models.IntegerField()
    fat = models.IntegerField()
    fiber = models.IntegerField(default=5)
    allergens = models.JSONField(default=list)
    tags = models.JSONField(default=list)
    prep_time = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.category} - {self.calories} kcal)"
