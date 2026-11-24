from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import os
import dj_database_url

from backend.meals.models import Meal
from backend.plans.models import MealPlan, MealPlanItem
from backend.users.models import NutritionProfile, Allergy, DislikedFood
from backend.coach.models import CoachActionLog
from backend.deliveries.models import Subscription, DeliveryAddress, DeliveryOrder
from backend.meals.management.commands.seed_meals import Command as SeedCommand
from backend.nutrition.recommender import generate_weekly_plan, query_fastapi_ml_scores


class NutriAIBackendAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed meals
        SeedCommand().handle()

        # Create test user A
        self.user_a_data = {
            'username': 'user_a',
            'email': 'usera@example.com',
            'password': 'Password123!',
            'first_name': 'User',
            'last_name': 'A'
        }
        res_a = self.client.post('/api/auth/register/', self.user_a_data, format='json')
        self.assertEqual(res_a.status_code, status.HTTP_201_CREATED)
        self.token_a = res_a.data['tokens']['access']
        self.user_a_id = res_a.data['user']['id']

        # Create test user B
        self.user_b_data = {
            'username': 'user_b',
            'email': 'userb@example.com',
            'password': 'Password123!',
            'first_name': 'User',
            'last_name': 'B'
        }
        res_b = self.client.post('/api/auth/register/', self.user_b_data, format='json')
        self.assertEqual(res_b.status_code, status.HTTP_201_CREATED)
        self.token_b = res_b.data['tokens']['access']
        self.user_b_id = res_b.data['user']['id']

        # Authenticate client as User A by default
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token_a)

    def test_01_authentication_and_me_endpoint(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['username'], 'user_a')
        self.assertEqual(res.data['profile']['daily_calories'], 3211)

    def test_02_nutrition_profile_update(self):
        payload = {
            'weight_kg': 80.0,
            'goal': 'weight_loss',
            'diet_type': 'vegan',
            'allergies': ['Peanuts'],
            'disliked_foods': ['Mushrooms']
        }
        res = self.client.put('/api/profile/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['diet_type'], 'vegan')
        self.assertIn('Peanuts', res.data['allergies'])
        self.assertIn('Mushrooms', res.data['disliked_foods'])

    def test_03_meals_catalog_endpoint(self):
        res = self.client.get('/api/meals/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 42)

        # Category filter
        res_b = self.client.get('/api/meals/?category=breakfast')
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        self.assertTrue(all(m['category'] == 'breakfast' for m in res_b.data))

    def test_04_meal_plan_generation_and_current_plan(self):
        res_gen = self.client.post('/api/plans/generate/')
        self.assertEqual(res_gen.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_gen.data['isActive'])
        self.assertGreater(len(res_gen.data['items']), 0)

        res_curr = self.client.get('/api/plans/current/')
        self.assertEqual(res_curr.status_code, status.HTTP_200_OK)
        self.assertEqual(res_curr.data['id'], res_gen.data['id'])

    def test_05_coach_message_action_engine(self):
        payload = {'message': 'Make me vegan and allergic to peanuts'}
        res = self.client.post('/api/coach/message/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['intent'], 'set_diet_type')
        self.assertEqual(res.data['updatedProfile']['diet_type'], 'vegan')

        # Check history
        res_hist = self.client.get('/api/coach/history/')
        self.assertEqual(res_hist.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_hist.data), 2)

    def test_06_swagger_openapi_schema(self):
        res = self.client.get('/api/schema/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res_ui = self.client.get('/api/schema/swagger-ui/')
        self.assertEqual(res_ui.status_code, status.HTTP_200_OK)

    def test_07_postgresql_database_url_support(self):
        test_url = "postgresql://postgres:testpass@db.supabase.co:5432/postgres"
        conf = dj_database_url.config(default=test_url)
        self.assertEqual(conf['ENGINE'], 'django.db.backends.postgresql')
        self.assertEqual(conf['NAME'], 'postgres')
        self.assertEqual(conf['USER'], 'postgres')
        self.assertEqual(conf['HOST'], 'db.supabase.co')
        self.assertEqual(conf['PORT'], 5432)

    def test_08_cross_user_authorization_safety(self):
        # User A generates a plan
        res_gen_a = self.client.post('/api/plans/generate/')
        self.assertEqual(res_gen_a.status_code, status.HTTP_201_CREATED)
        plan_a_id = res_gen_a.data['id']
        item_a_id = res_gen_a.data['items'][0]['id']

        # Switch authentication to User B
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token_b)

        # User B attempts to lock User A's meal item -> Must fail with 404
        res_lock = self.client.post(f'/api/plans/{plan_a_id}/items/{item_a_id}/lock/')
        self.assertEqual(res_lock.status_code, status.HTTP_404_NOT_FOUND)

        # User B attempts to replace User A's meal item -> Must fail with 404
        res_rep = self.client.post(f'/api/plans/{plan_a_id}/items/{item_a_id}/replace/')
        self.assertEqual(res_rep.status_code, status.HTTP_404_NOT_FOUND)

        # User B checks coach history -> Must NOT see User A's logs
        res_hist_b = self.client.get('/api/coach/history/')
        self.assertEqual(res_hist_b.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_hist_b.data), 0)

    def test_09_fastapi_ml_offline_fallback(self):
        profile = {'age': 22, 'weight_kg': 87, 'height_cm': 178, 'goal': 'muscle_gain'}
        targets = {'daily_calories': 3200, 'protein_grams': 240}
        candidates = [{'id': 'b-01', 'name': 'Test Meal', 'calories': 500, 'protein': 30}]

        from backend.nutrition import recommender
        original_url = recommender.FASTAPI_ML_URL
        recommender.FASTAPI_ML_URL = "http://127.0.0.1:59999"

        try:
            scores = query_fastapi_ml_scores(profile, targets, candidates, 'breakfast')
            self.assertEqual(scores, {})

            res_gen = self.client.post('/api/plans/generate/')
            self.assertEqual(res_gen.status_code, status.HTTP_201_CREATED)
            self.assertGreater(len(res_gen.data['items']), 0)
        finally:
            recommender.FASTAPI_ML_URL = original_url

    def test_10_conversational_preference_persistence(self):
        res_msg = self.client.post('/api/coach/message/', {'message': "I don't like paneer"}, format='json')
        self.assertEqual(res_msg.status_code, status.HTTP_200_OK)

        user_a = User.objects.get(id=self.user_a_id)
        dislikes = DislikedFood.objects.filter(profile=user_a.nutrition_profile)
        self.assertTrue(any(d.ingredient.lower() == 'paneer' for d in dislikes))

        res_gen = self.client.post('/api/plans/generate/')
        self.assertEqual(res_gen.status_code, status.HTTP_201_CREATED)

        logs = CoachActionLog.objects.filter(user=user_a)
        self.assertGreaterEqual(len(logs), 2)

    def test_11_seeding_idempotency(self):
        initial_count = Meal.objects.count()
        self.assertEqual(initial_count, 42)

        SeedCommand().handle()
        SeedCommand().handle()

        final_count = Meal.objects.count()
        self.assertEqual(final_count, 42)

    def test_12_subscription_checkout_and_razorpay_verification(self):
        # Step 1: Create payment order request
        res_order = self.client.post('/api/deliveries/subscription/create-payment/', {
            'tier': 'premium',
            'billingFrequency': 'weekly'
        }, format='json')
        self.assertEqual(res_order.status_code, status.HTTP_200_OK)
        self.assertIn('orderId', res_order.data)
        self.assertEqual(res_order.data['amountInr'], 2499)

        # Step 2: Verify payment server-side
        verify_payload = {
            'razorpayOrderId': res_order.data['orderId'],
            'razorpayPaymentId': 'pay_test_998877',
            'razorpaySignature': 'test_signature',
            'tier': 'premium',
            'billingFrequency': 'weekly'
        }
        res_verify = self.client.post('/api/deliveries/subscription/verify-payment/', verify_payload, format='json')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)
        self.assertEqual(res_verify.data['subscription']['status'], 'active')
        self.assertEqual(res_verify.data['subscription']['tier'], 'premium')

    def test_13_subscription_cancellation(self):
        # Create active subscription first
        sub = Subscription.objects.create(user_id=self.user_a_id, status='active', tier='premium')

        # Cancel subscription
        res_cancel = self.client.post('/api/deliveries/subscription/cancel/')
        self.assertEqual(res_cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(res_cancel.data['status'], 'cancelled')

    def test_14_address_management_and_authorization(self):
        # User A creates address
        addr_payload = {
            'fullName': 'User A',
            'phone': '+91 99999 88888',
            'addressLine1': '123 Main St',
            'city': 'Noida',
            'state': 'UP',
            'postalCode': '201301'
        }
        res_addr = self.client.post('/api/deliveries/addresses/', addr_payload, format='json')
        self.assertEqual(res_addr.status_code, status.HTTP_201_CREATED)
        addr_id = res_addr.data['id']

        # Switch to User B
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token_b)

        # User B attempts to delete User A's address -> Must fail with 404
        res_del = self.client.delete(f'/api/deliveries/addresses/{addr_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_404_NOT_FOUND)

    def test_15_delivery_order_creation_and_authorization(self):
        # User A creates order
        order_payload = {
            'mealName': 'Paneer Power Bowl',
            'mealCategory': 'Lunch',
            'scheduledDate': '2026-10-10'
        }
        res_ord = self.client.post('/api/deliveries/orders/', order_payload, format='json')
        self.assertEqual(res_ord.status_code, status.HTTP_201_CREATED)
        order_id = res_ord.data['id']
        token = res_ord.data['verificationToken']

        # Switch to User B
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token_b)

        # User B attempts to cancel User A's order -> Must fail with 404
        res_cancel = self.client.post(f'/api/deliveries/orders/{order_id}/cancel/')
        self.assertEqual(res_cancel.status_code, status.HTTP_404_NOT_FOUND)

    def test_16_qr_code_token_verification(self):
        # Create order for User A
        order = DeliveryOrder.objects.create(
            user_id=self.user_a_id,
            scheduled_date='2026-10-10',
            meal_name='Tofu Teriyaki Stir-Fry',
            meal_category='Lunch',
            status='confirmed',
            verification_token=DeliveryOrder.generate_token()
        )

        # Verify QR token via public scanner endpoint
        res_v1 = self.client.post('/api/deliveries/verify/', {'token': order.verification_token}, format='json')
        self.assertEqual(res_v1.status_code, status.HTTP_200_OK)
        self.assertTrue(res_v1.data['success'])
        self.assertEqual(res_v1.data['order']['status'], 'delivered')

        # Repeat verification attempt -> Must fail with 400 Bad Request
        res_v2 = self.client.post('/api/deliveries/verify/', {'token': order.verification_token}, format='json')
        self.assertEqual(res_v2.status_code, status.HTTP_400_BAD_REQUEST)
