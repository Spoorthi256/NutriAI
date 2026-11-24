import re
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.coach.models import CoachActionLog
from backend.coach.serializers import CoachActionLogSerializer
from backend.users.models import NutritionProfile, Allergy, DislikedFood
from backend.users.serializers import NutritionProfileSerializer
from backend.plans.models import MealPlan
from backend.plans.serializers import MealPlanSerializer
from backend.plans.views import _generate_and_save_plan


class CoachMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Log user message
        CoachActionLog.objects.create(
            user=request.user,
            role='user',
            message=user_message
        )

        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        active_plan = MealPlan.objects.filter(user=request.user, is_active=True).first()

        # Phase 5 Rule-Based Intent Extraction & Execution
        intent, params, rationale = _parse_intent(user_message)
        state_modified = False
        action_type = None

        if intent == 'set_diet_type':
            diet = params.get('diet_type')
            profile.diet_type = diet
            profile.save()
            state_modified = True
            action_type = 'UPDATE_DIET'
            assistant_reply = f"I've updated your diet preference to **{diet.replace('_', ' ').capitalize()}**. Rebuilding your meal plan to ensure 100% compliance..."

        elif intent == 'add_allergy':
            allergy = params.get('allergy')
            Allergy.objects.get_or_create(profile=profile, ingredient=allergy)
            state_modified = True
            action_type = 'ADD_ALLERGY'
            assistant_reply = f"Added **{allergy}** to your safety exclusion list. Regenerating your plan to remove any allergenic candidates..."

        elif intent == 'remove_allergy':
            allergy = params.get('allergy')
            Allergy.objects.filter(profile=profile, ingredient__iexact=allergy).delete()
            state_modified = True
            action_type = 'REMOVE_ALLERGY'
            assistant_reply = f"Removed **{allergy}** from your safety exclusion list. Updating candidate pool..."

        elif intent == 'dislike_food':
            food = params.get('food')
            DislikedFood.objects.get_or_create(profile=profile, ingredient=food)
            state_modified = True
            action_type = 'DISLIKE_FOOD'
            assistant_reply = f"Noted that you dislike **{food}**. Adjusting meal scoring to penalize meals containing this item..."

        elif intent == 'set_goal':
            goal = params.get('goal')
            profile.goal = goal
            profile.save()
            state_modified = True
            action_type = 'UPDATE_GOAL'
            assistant_reply = f"Updated your primary goal to **{goal.replace('_', ' ').capitalize()}**. Recalculating target calories and macros..."

        elif intent == 'set_meals_per_day':
            count = params.get('count')
            profile.meals_per_day = count
            profile.save()
            state_modified = True
            action_type = 'UPDATE_MEAL_COUNT'
            assistant_reply = f"Configured your plan schedule for **{count} meals per day**."

        else:
            action_type = 'EXPLAIN'
            assistant_reply = (
                f"I've analyzed your profile ({profile.get_diet_type_display()}, {profile.daily_calories} kcal/day target). "
                f"Your active 7-day meal plan has been optimized using your dietary constraints and Phase 4 ML ranking."
            )

        updated_plan_data = None
        if state_modified or not active_plan:
            plan_response = _generate_and_save_plan(request.user)
            updated_plan_data = plan_response.data
        else:
            updated_plan_data = MealPlanSerializer(active_plan).data

        # Log assistant response
        CoachActionLog.objects.create(
            user=request.user,
            role='assistant',
            message=assistant_reply,
            intent=intent,
            confidence=0.95,
            action_type=action_type,
            rationale=rationale
        )

        profile.refresh_from_db()

        return Response({
            'intent': intent,
            'actionType': action_type,
            'rationale': rationale,
            'coachMessage': assistant_reply,
            'updatedProfile': NutritionProfileSerializer(profile).data,
            'updatedPlan': updated_plan_data
        })


class CoachHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = CoachActionLog.objects.filter(user=request.user).order_by('created_at')
        serializer = CoachActionLogSerializer(logs, many=True)
        return Response(serializer.data)


def _parse_intent(text: str):
    msg = text.lower()

    if 'vegan' in msg:
        return 'set_diet_type', {'diet_type': 'vegan'}, "User requested Vegan diet."
    if 'vegetarian' in msg or 'veg' in msg:
        return 'set_diet_type', {'diet_type': 'vegetarian'}, "User requested Vegetarian diet."
    if 'keto' in msg:
        return 'set_diet_type', {'diet_type': 'keto'}, "User requested Keto diet."
    if 'mediterranean' in msg:
        return 'set_diet_type', {'diet_type': 'mediterranean'}, "User requested Mediterranean diet."

    if 'allergic to' in msg or 'allergy' in msg or 'no peanuts' in msg or 'no dairy' in msg:
        m = re.search(r'(?:allergic to|no|avoid|allergic)\s+([a-z\s]+)', msg)
        allergy = m.group(1).strip() if m else 'Peanuts'
        return 'add_allergy', {'allergy': allergy.capitalize()}, f"Extracted allergy: {allergy}"

    if 'dislike' in msg or 'hate' in msg or 'don\'t like' in msg:
        m = re.search(r'(?:dislike|hate|don\'t like)\s+([a-z\s]+)', msg)
        food = m.group(1).strip() if m else 'Mushrooms'
        return 'dislike_food', {'food': food.capitalize()}, f"Extracted disliked food: {food}"

    if 'muscle gain' in msg or 'build muscle' in msg:
        return 'set_goal', {'goal': 'muscle_gain'}, "User set goal to Muscle Gain."
    if 'weight loss' in msg or 'lose weight' in msg:
        return 'set_goal', {'goal': 'weight_loss'}, "User set goal to Weight Loss."

    if '3 meals' in msg:
        return 'set_meals_per_day', {'count': 3}, "Set meal count to 3 per day."
    if '4 meals' in msg:
        return 'set_meals_per_day', {'count': 4}, "Set meal count to 4 per day."
    if '5 meals' in msg:
        return 'set_meals_per_day', {'count': 5}, "Set meal count to 5 per day."

    return 'general_chat', {}, "General conversation inquiry."
