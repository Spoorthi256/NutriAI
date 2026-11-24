from rest_framework import serializers
from backend.meals.models import Meal


class MealSerializer(serializers.ModelSerializer):
    mealType = serializers.CharField(source='meal_type')
    dietTypes = serializers.JSONField(source='diet_types')
    prepTime = serializers.CharField(source='prep_time')

    class Meta:
        model = Meal
        fields = [
            'id', 'name', 'category', 'mealType', 'dietTypes',
            'ingredients', 'calories', 'protein', 'carbs', 'fat',
            'fiber', 'allergens', 'tags', 'prepTime', 'description'
        ]
