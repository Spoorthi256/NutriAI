from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.plans.models import MealPlan, MealPlanItem
from backend.plans.serializers import MealPlanSerializer, MealPlanItemSerializer
from backend.users.models import NutritionProfile
from backend.meals.models import Meal
from backend.nutrition.recommender import generate_weekly_plan, get_recommendation_candidates
from backend.meals.serializers import MealSerializer


def _serialize_meal_obj(m: Meal) -> dict:
    return {
        'id': m.id,
        'name': m.name,
        'category': m.category,
        'mealType': m.meal_type,
        'dietTypes': m.diet_types,
        'ingredients': m.ingredients,
        'calories': m.calories,
        'protein': m.protein,
        'carbs': m.carbs,
        'fat': m.fat,
        'fiber': m.fiber,
        'allergens': m.allergens,
        'tags': m.tags,
        'prepTime': m.prep_time,
        'description': m.description,
    }


def _get_profile_dict(profile: NutritionProfile) -> dict:
    allergies = [a.ingredient for a in profile.allergies_rel.all()]
    dislikes = [d.ingredient for d in profile.dislikes_rel.all()]
    return {
        'age': profile.age,
        'heightCm': profile.height_cm,
        'weightKg': profile.weight_kg,
        'gender': profile.gender,
        'goal': profile.goal,
        'activityLevel': profile.activity_level,
        'dietType': profile.diet_type,
        'mealsPerDay': profile.meals_per_day,
        'trainingDays': profile.training_days,
        'allergies': allergies,
        'dislikedFoods': dislikes,
    }


class CurrentMealPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_plan = MealPlan.objects.filter(user=request.user, is_active=True).first()
        if not active_plan:
            # Generate new plan on demand
            return _generate_and_save_plan(request.user)
        return Response(MealPlanSerializer(active_plan).data)


class GenerateMealPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return _generate_and_save_plan(request.user)


def _generate_and_save_plan(user):
    profile, _ = NutritionProfile.objects.get_or_create(user=user)
    profile_dict = _get_profile_dict(profile)
    all_meals = [_serialize_meal_obj(m) for m in Meal.objects.all()]

    plan_result = generate_weekly_plan(profile_dict, all_meals)

    # Deactivate existing active plans
    MealPlan.objects.filter(user=user, is_active=True).update(is_active=False)

    targets = plan_result['targets']
    daily_calories = targets.get('daily_calories') or targets.get('dailyCalories', 2500)
    protein_grams = targets.get('protein_grams') or targets.get('proteinGrams', 150)
    carbs_grams = targets.get('carbs_grams') or targets.get('carbsGrams', 300)
    fat_grams = targets.get('fat_grams') or targets.get('fatGrams', 70)

    # Create new plan
    plan = MealPlan.objects.create(
        user=user,
        daily_calories=daily_calories,
        protein_grams=protein_grams,
        carbs_grams=carbs_grams,
        fat_grams=fat_grams,
        is_active=True
    )

    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day in days:
        day_schedule = plan_result['schedule'].get(day, [])
        for item in day_schedule:
            meal_obj = Meal.objects.filter(id=item['meal']['id']).first()
            if meal_obj:
                MealPlanItem.objects.create(
                    plan=plan,
                    day=day,
                    slot=item['slot'],
                    slot_display=item['slotDisplay'],
                    meal=meal_obj,
                    score=item.get('score', 0.0),
                    is_user_locked=item.get('isUserLocked', False)
                )

    plan.refresh_from_db()
    return Response(MealPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class ReplaceMealItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, plan_id, item_id):
        item = MealPlanItem.objects.filter(id=item_id, plan__user=request.user, plan_id=plan_id).first()
        if not item:
            return Response({'error': 'Meal item not found'}, status=status.HTTP_404_NOT_FOUND)

        target_meal_id = request.data.get('targetMealId')
        profile = request.user.nutrition_profile
        profile_dict = _get_profile_dict(profile)
        all_meals = [_serialize_meal_obj(m) for m in Meal.objects.all()]

        if target_meal_id:
            new_meal_obj = Meal.objects.filter(id=target_meal_id).first()
            if not new_meal_obj:
                return Response({'error': 'Target meal not found'}, status=status.HTTP_404_NOT_FOUND)
            item.meal = new_meal_obj
            item.save()
            return Response(MealPlanItemSerializer(item).data)

        # Automatic replacement candidate selection
        candidates = get_recommendation_candidates(profile_dict, all_meals, item.slot)
        if not candidates:
            return Response({'error': 'No compatible replacement meals found'}, status=status.HTTP_400_BAD_REQUEST)

        # Exclude current meal
        filtered_candidates = [c for c in candidates if c['meal']['id'] != item.meal.id]
        if not filtered_candidates:
            filtered_candidates = candidates

        top_candidate = filtered_candidates[0]['meal']
        new_meal_obj = Meal.objects.filter(id=top_candidate['id']).first()
        if new_meal_obj:
            item.meal = new_meal_obj
            item.score = filtered_candidates[0].get('score', 0.0)
            item.save()

        return Response(MealPlanItemSerializer(item).data)


class LockMealItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, plan_id, item_id):
        item = MealPlanItem.objects.filter(id=item_id, plan__user=request.user, plan_id=plan_id).first()
        if not item:
            return Response({'error': 'Meal item not found'}, status=status.HTTP_404_NOT_FOUND)

        item.is_user_locked = not item.is_user_locked
        item.save()
        return Response(MealPlanItemSerializer(item).data)
