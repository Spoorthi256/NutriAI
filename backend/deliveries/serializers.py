from rest_framework import serializers
from backend.deliveries.models import Subscription, DeliveryAddress, DeliveryOrder


class SubscriptionSerializer(serializers.ModelSerializer):
    billingFrequency = serializers.CharField(source='billing_frequency')
    razorpayCustomerId = serializers.CharField(source='razorpay_customer_id', read_only=True)
    razorpaySubscriptionId = serializers.CharField(source='razorpay_subscription_id', read_only=True)
    razorpayOrderId = serializers.CharField(source='razorpay_order_id', read_only=True)
    razorpayPaymentId = serializers.CharField(source='razorpay_payment_id', read_only=True)
    currentPeriodStart = serializers.DateTimeField(source='current_period_start', read_only=True)
    currentPeriodEnd = serializers.DateTimeField(source='current_period_end', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'status', 'tier', 'billingFrequency', 'amount', 'currency',
            'razorpayCustomerId', 'razorpaySubscriptionId', 'razorpayOrderId',
            'razorpayPaymentId', 'currentPeriodStart', 'currentPeriodEnd', 'createdAt'
        ]


class DeliveryAddressSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    addressLine1 = serializers.CharField(source='address_line_1')
    addressLine2 = serializers.CharField(source='address_line_2', required=False, allow_blank=True)
    postalCode = serializers.CharField(source='postal_code')
    isDefault = serializers.BooleanField(source='is_default', required=False, default=True)

    class Meta:
        model = DeliveryAddress
        fields = [
            'id', 'fullName', 'phone', 'addressLine1', 'addressLine2',
            'city', 'state', 'postalCode', 'country', 'isDefault'
        ]


class DeliveryOrderSerializer(serializers.ModelSerializer):
    deliveryDate = serializers.DateField(source='scheduled_date')
    mealName = serializers.CharField(source='meal_name')
    mealCategory = serializers.CharField(source='meal_category')
    timeSlot = serializers.CharField(source='time_slot')
    addressText = serializers.CharField(source='address_text')
    verificationToken = serializers.CharField(source='verification_token')
    deliveredAt = serializers.DateTimeField(source='delivered_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'deliveryDate', 'mealName', 'mealCategory', 'timeSlot',
            'status', 'addressText', 'verificationToken', 'deliveredAt', 'createdAt'
        ]
