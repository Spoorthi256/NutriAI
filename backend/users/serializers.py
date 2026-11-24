from rest_framework import serializers
from django.contrib.auth.models import User
from backend.users.models import NutritionProfile, Allergy, DislikedFood
from backend.nutrition.calculations import calculate_nutrition_targets


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Create default profile
        targets = calculate_nutrition_targets({
            'weight_kg': 87.0,
            'height_cm': 178.0,
            'age': 22,
            'gender': 'male',
            'goal': 'muscle_gain',
            'activity_level': 'moderate'
        })
        NutritionProfile.objects.create(
            user=user,
            age=22,
            height_cm=178.0,
            weight_kg=87.0,
            gender='male',
            goal='muscle_gain',
            activity_level='moderate',
            diet_type='vegetarian',
            meals_per_day=4,
            training_days=5,
            daily_calories=targets['daily_calories'],
            protein_grams=targets['protein_grams'],
            carbs_grams=targets['carbs_grams'],
            fat_grams=targets['fat_grams']
        )
        return user


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'ingredient']


class DislikedFoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DislikedFood
        fields = ['id', 'ingredient']


class NutritionProfileSerializer(serializers.ModelSerializer):
    allergies = serializers.SerializerMethodField()
    disliked_foods = serializers.SerializerMethodField()

    class Meta:
        model = NutritionProfile
        fields = [
            'id', 'age', 'height_cm', 'weight_kg', 'gender', 'goal',
            'activity_level', 'diet_type', 'meals_per_day', 'training_days',
            'daily_calories', 'protein_grams', 'carbs_grams', 'fat_grams',
            'allergies', 'disliked_foods', 'updated_at'
        ]
        read_only_fields = ['daily_calories', 'protein_grams', 'carbs_grams', 'fat_grams', 'updated_at']

    def get_allergies(self, obj):
        return [a.ingredient for a in obj.allergies_rel.all()]

    def get_disliked_foods(self, obj):
        return [d.ingredient for d in obj.dislikes_rel.all()]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate targets using Phase 3 Python calculation mirror
        targets = calculate_nutrition_targets({
            'weight_kg': instance.weight_kg,
            'height_cm': instance.height_cm,
            'age': instance.age,
            'gender': instance.gender,
            'goal': instance.goal,
            'activity_level': instance.activity_level
        })
        instance.daily_calories = targets['daily_calories']
        instance.protein_grams = targets['protein_grams']
        instance.carbs_grams = targets['carbs_grams']
        instance.fat_grams = targets['fat_grams']
        instance.save()
        return instance
