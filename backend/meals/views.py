from rest_framework import generics, permissions
from backend.meals.models import Meal
from backend.meals.serializers import MealSerializer


class MealListView(generics.ListAPIView):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Meal.objects.all()
        category = self.request.query_params.get('category')
        diet_type = self.request.query_params.get('dietType')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if diet_type:
            queryset = [m for m in queryset if diet_type in m.diet_types]
        if search:
            queryset = [m for m in queryset if search.lower() in m.name.lower() or search.lower() in m.description.lower()]

        return queryset


class MealDetailView(generics.RetrieveAPIView):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
