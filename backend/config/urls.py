from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from backend.users.views import (
    RegisterView, MeView, NutritionProfileView,
    ManageAllergiesView, ManageDislikesView
)
from backend.meals.views import MealListView, MealDetailView
from backend.plans.views import (
    CurrentMealPlanView, GenerateMealPlanView,
    ReplaceMealItemView, LockMealItemView
)
from backend.coach.views import CoachMessageView, CoachHistoryView
from backend.deliveries.views import (
    SubscriptionView, CreatePaymentOrderView, VerifyPaymentView, CancelSubscriptionView,
    ManageAddressesView, AddressDetailView,
    DeliveryOrdersView, DeliveryOrderDetailView, CancelOrderView,
    QRVerificationView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),

    # Profile & Preference Endpoints
    path('api/profile/', NutritionProfileView.as_view(), name='profile_detail'),
    path('api/profile/allergies/', ManageAllergiesView.as_view(), name='profile_allergies'),
    path('api/profile/dislikes/', ManageDislikesView.as_view(), name='profile_dislikes'),

    # Meals Catalog Endpoints
    path('api/meals/', MealListView.as_view(), name='meal_list'),
    path('api/meals/<str:id>/', MealDetailView.as_view(), name='meal_detail'),

    # Meal Plan Endpoints
    path('api/plans/current/', CurrentMealPlanView.as_view(), name='plan_current'),
    path('api/plans/generate/', GenerateMealPlanView.as_view(), name='plan_generate'),
    path('api/plans/<int:plan_id>/items/<int:item_id>/replace/', ReplaceMealItemView.as_view(), name='plan_item_replace'),
    path('api/plans/<int:plan_id>/items/<int:item_id>/lock/', LockMealItemView.as_view(), name='plan_item_lock'),

    # AI Coach Action Endpoints
    path('api/coach/message/', CoachMessageView.as_view(), name='coach_message'),
    path('api/coach/history/', CoachHistoryView.as_view(), name='coach_history'),

    # Subscriptions & Payment Endpoints
    path('api/deliveries/subscription/', SubscriptionView.as_view(), name='delivery_subscription'),
    path('api/deliveries/subscription/create-payment/', CreatePaymentOrderView.as_view(), name='subscription_create_payment'),
    path('api/deliveries/subscription/verify-payment/', VerifyPaymentView.as_view(), name='subscription_verify_payment'),
    path('api/deliveries/subscription/cancel/', CancelSubscriptionView.as_view(), name='subscription_cancel'),

    # Delivery Addresses Endpoints
    path('api/deliveries/addresses/', ManageAddressesView.as_view(), name='delivery_addresses'),
    path('api/deliveries/addresses/<int:pk>/', AddressDetailView.as_view(), name='delivery_address_detail'),

    # Delivery Orders & Verification Endpoints
    path('api/deliveries/orders/', DeliveryOrdersView.as_view(), name='delivery_orders'),
    path('api/deliveries/orders/<int:pk>/', DeliveryOrderDetailView.as_view(), name='delivery_order_detail'),
    path('api/deliveries/orders/<int:pk>/cancel/', CancelOrderView.as_view(), name='delivery_order_cancel'),
    path('api/deliveries/verify/', QRVerificationView.as_view(), name='delivery_qr_verify'),

    # Swagger / OpenAPI Schema Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
