import json
import os
from django.core.management.base import BaseCommand
from backend.meals.models import Meal


class Command(BaseCommand):
    help = 'Seeds the database with 42 initial meals from meals.json fixture'

    def handle(self, *args, **options):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        fixture_path = os.path.join(base_dir, 'meals', 'fixtures', 'meals.json')

        if not os.path.exists(fixture_path):
            self.stderr.write(self.style.ERROR(f"Fixture file not found at {fixture_path}"))
            return

        with open(fixture_path, 'r', encoding='utf-8') as f:
            meals_data = json.load(f)

        created_count = 0
        updated_count = 0

        for m in meals_data:
            meal_obj, created = Meal.objects.update_or_create(
                id=m['id'],
                defaults={
                    'name': m['name'],
                    'category': m['category'],
                    'meal_type': m['mealType'],
                    'diet_types': m['dietTypes'],
                    'ingredients': m['ingredients'],
                    'calories': m['calories'],
                    'protein': m['protein'],
                    'carbs': m['carbs'],
                    'fat': m['fat'],
                    'fiber': m.get('fiber', 5),
                    'allergens': m['allergens'],
                    'tags': m['tags'],
                    'prep_time': m['prepTime'],
                    'description': m['description'],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully processed {len(meals_data)} meals ({created_count} created, {updated_count} updated)."
        ))
