from rest_framework import serializers
from backend.plans.models import MealPlan, MealPlanItem
from backend.meals.serializers import MealSerializer


class MealPlanItemSerializer(serializers.ModelSerializer):
    slotDisplay = serializers.CharField(source='slot_display')
    isUserLocked = serializers.BooleanField(source='is_user_locked')
    meal = MealSerializer()

    class Meta:
        model = MealPlanItem
        fields = ['id', 'day', 'slot', 'slotDisplay', 'meal', 'score', 'isUserLocked']


class MealPlanSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    dailyCalories = serializers.IntegerField(source='daily_calories')
    proteinGrams = serializers.IntegerField(source='protein_grams')
    carbsGrams = serializers.IntegerField(source='carbs_grams')
    fatGrams = serializers.IntegerField(source='fat_grams')
    isActive = serializers.BooleanField(source='is_active')
    items = MealPlanItemSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlan
        fields = [
            'id', 'createdAt', 'updatedAt', 'dailyCalories',
            'proteinGrams', 'carbsGrams', 'fatGrams', 'isActive', 'items'
        ]
