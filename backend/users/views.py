from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from backend.users.models import NutritionProfile, Allergy, DislikedFood
from backend.users.serializers import (
    UserSerializer, RegisterSerializer, NutritionProfileSerializer,
    AllergySerializer, DislikedFoodSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        profile = user.nutrition_profile
        profile_serializer = NutritionProfileSerializer(profile)

        return Response({
            'user': UserSerializer(user).data,
            'profile': profile_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = NutritionProfile.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'profile': NutritionProfileSerializer(profile).data
        })


class NutritionProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        return Response(NutritionProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        serializer = NutritionProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Handle allergy / disliked food lists if provided in PUT payload
        if 'allergies' in request.data and isinstance(request.data['allergies'], list):
            Allergy.objects.filter(profile=profile).delete()
            for ing in request.data['allergies']:
                if ing and isinstance(ing, str):
                    Allergy.objects.create(profile=profile, ingredient=ing.strip())

        if 'disliked_foods' in request.data and isinstance(request.data['disliked_foods'], list):
            DislikedFood.objects.filter(profile=profile).delete()
            for ing in request.data['disliked_foods']:
                if ing and isinstance(ing, str):
                    DislikedFood.objects.create(profile=profile, ingredient=ing.strip())

        # Re-fetch updated profile to include updated lists
        profile.refresh_from_db()
        return Response(NutritionProfileSerializer(profile).data)


class ManageAllergiesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        ingredient = request.data.get('ingredient', '').strip()
        if not ingredient:
            return Response({'error': 'Ingredient is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        allergy, created = Allergy.objects.get_or_create(profile=profile, ingredient=ingredient)
        return Response({'allergies': [a.ingredient for a in profile.allergies_rel.all()]})

    def delete(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        ingredient = request.data.get('ingredient', '').strip()
        if ingredient:
            Allergy.objects.filter(profile=profile, ingredient=ingredient).delete()
        return Response({'allergies': [a.ingredient for a in profile.allergies_rel.all()]})


class ManageDislikesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        ingredient = request.data.get('ingredient', '').strip()
        if not ingredient:
            return Response({'error': 'Ingredient is required'}, status=status.HTTP_400_BAD_REQUEST)

        DislikedFood.objects.get_or_create(profile=profile, ingredient=ingredient)
        return Response({'disliked_foods': [d.ingredient for d in profile.dislikes_rel.all()]})

    def delete(self, request):
        profile, _ = NutritionProfile.objects.get_or_create(user=request.user)
        ingredient = request.data.get('ingredient', '').strip()
        if ingredient:
            DislikedFood.objects.filter(profile=profile, ingredient=ingredient).delete()
        return Response({'disliked_foods': [d.ingredient for d in profile.dislikes_rel.all()]})
