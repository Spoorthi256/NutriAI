import uuid
import secrets
from django.db import models
from django.contrib.auth.models import User
from backend.plans.models import MealPlan


def generate_delivery_token() -> str:
    return f"nutri_{uuid.uuid4().hex[:12]}_{secrets.token_hex(8)}"


class Subscription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    TIER_CHOICES = [
        ('basic', 'Basic Plan'),
        ('premium', 'Premium Plan'),
    ]

    BILLING_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=50, choices=TIER_CHOICES, default='premium')
    billing_frequency = models.CharField(max_length=20, choices=BILLING_CHOICES, default='weekly')
    amount = models.IntegerField(default=2499)  # in INR (₹)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    razorpay_customer_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.tier} ({self.status})"


class DeliveryAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=50, default='India')
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.address_line_1}, {self.city}"


class DeliveryOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delivery_orders')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    plan = models.ForeignKey(MealPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='delivery_orders')
    address = models.ForeignKey(DeliveryAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    address_text = models.TextField(blank=True)
    meal_name = models.CharField(max_length=255, blank=True)
    meal_category = models.CharField(max_length=50, blank=True)
    time_slot = models.CharField(max_length=50, default='12:30 PM - 1:15 PM')
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verification_token = models.CharField(max_length=64, unique=True, default=generate_delivery_token)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-scheduled_date', '-created_at']

    @classmethod
    def generate_token(cls) -> str:
        return generate_delivery_token()

    def __str__(self):
        return f"Order #{self.id} for {self.user.username} ({self.scheduled_date}) - {self.status}"
