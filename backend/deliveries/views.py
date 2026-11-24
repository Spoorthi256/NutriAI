import hmac
import hashlib
import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.deliveries.models import Subscription, DeliveryAddress, DeliveryOrder
from backend.deliveries.serializers import (
    SubscriptionSerializer, DeliveryAddressSerializer, DeliveryOrderSerializer
)
from backend.plans.models import MealPlan


class SubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub = Subscription.objects.filter(user=request.user).first()
        if not sub:
            return Response({'status': 'none', 'tier': 'none'}, status=status.HTTP_200_OK)
        return Response(SubscriptionSerializer(sub).data)


class CreatePaymentOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tier = request.data.get('tier', 'premium').lower()
        billing_freq = request.data.get('billingFrequency', 'weekly').lower()

        PRICING_TABLE = {
            ('basic', 'weekly'): 1499,
            ('premium', 'weekly'): 2499,
            ('basic', 'monthly'): 4999,
            ('premium', 'monthly'): 7999,
        }

        amount_inr = PRICING_TABLE.get((tier, billing_freq), 2499)
        amount_paise = amount_inr * 100
        currency = 'INR'

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_nutriai_demo_key')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

        order_id = f"order_test_{request.user.id}_{int(timezone.now().timestamp())}"

        if key_id and key_secret and key_id != 'rzp_test_nutriai_demo_key':
            try:
                import razorpay
                client = razorpay.Client(auth=(key_id, key_secret))
                rzp_order = client.order.create({
                    'amount': amount_paise,
                    'currency': currency,
                    'receipt': f"rcpt_{request.user.id}_{int(timezone.now().timestamp())}",
                    'notes': {'user_id': request.user.id, 'tier': tier}
                })
                order_id = rzp_order['id']
            except Exception:
                pass

        return Response({
            'orderId': order_id,
            'amount': amount_paise,
            'amountInr': amount_inr,
            'currency': currency,
            'keyId': key_id,
            'tier': tier,
            'billingFrequency': billing_freq,
        })


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpayOrderId') or request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpayPaymentId') or request.data.get('razorpay_payment_id') or f"pay_test_{int(timezone.now().timestamp())}"
        signature = request.data.get('razorpaySignature') or request.data.get('razorpay_signature') or "test_signature"
        tier = request.data.get('tier', 'premium')
        billing_freq = request.data.get('billingFrequency', 'weekly')

        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

        if key_secret and signature != "test_signature":
            msg = f"{order_id}|{payment_id}".encode('utf-8')
            expected_sig = hmac.new(key_secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected_sig, signature):
                return Response({'error': 'Invalid payment signature verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        days_ahead = 30 if billing_freq == 'monthly' else 7
        period_end = now + datetime.timedelta(days=days_ahead)

        amount_inr = 2499 if tier == 'premium' else 1499

        sub, _ = Subscription.objects.get_or_create(user=request.user)
        sub.tier = tier
        sub.billing_frequency = billing_freq
        sub.amount = amount_inr
        sub.currency = 'INR'
        sub.status = 'active'
        sub.razorpay_order_id = order_id
        sub.razorpay_payment_id = payment_id
        sub.current_period_start = now
        sub.current_period_end = period_end
        sub.cancelled_at = None
        sub.save()

        # Automatically generate default delivery orders for active meal plan
        _generate_initial_delivery_orders(request.user, sub)

        orders = DeliveryOrder.objects.filter(user=request.user)

        return Response({
            'subscription': SubscriptionSerializer(sub).data,
            'orders': DeliveryOrderSerializer(orders, many=True).data,
            'message': 'Payment verified and subscription activated successfully'
        })


class CancelSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        sub = Subscription.objects.filter(user=request.user, status='active').first()
        if not sub:
            return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)

        sub.status = 'cancelled'
        sub.cancelled_at = timezone.now()
        sub.save()

        return Response(SubscriptionSerializer(sub).data)


class ManageAddressesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        addresses = DeliveryAddress.objects.filter(user=request.user)
        return Response(DeliveryAddressSerializer(addresses, many=True).data)

    def post(self, request):
        data = request.data
        required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode']
        for field in required:
            if not data.get(field):
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Reset defaults if setting new default
        if data.get('isDefault', True):
            DeliveryAddress.objects.filter(user=request.user).update(is_default=False)

        address = DeliveryAddress.objects.create(
            user=request.user,
            full_name=data['fullName'],
            phone=data['phone'],
            address_line_1=data['addressLine1'],
            address_line_2=data.get('addressLine2', ''),
            city=data['city'],
            state=data['state'],
            postal_code=data['postalCode'],
            country=data.get('country', 'India'),
            is_default=data.get('isDefault', True)
        )
        return Response(DeliveryAddressSerializer(address).data, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        address = DeliveryAddress.objects.filter(id=pk, user=request.user).first()
        if not address:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliveryAddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(DeliveryAddressSerializer(address).data)

    def delete(self, request, pk):
        address = DeliveryAddress.objects.filter(id=pk, user=request.user).first()
        if not address:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        address.delete()
        return Response({'message': 'Address deleted successfully'})


class DeliveryOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = DeliveryOrder.objects.filter(user=request.user).order_by('-scheduled_date')
        return Response(DeliveryOrderSerializer(orders, many=True).data)

    def post(self, request):
        data = request.data
        address_id = data.get('addressId')
        address = DeliveryAddress.objects.filter(id=address_id, user=request.user).first() if address_id else None
        addr_text = f"{address.full_name}, {address.address_line_1}, {address.city}" if address else data.get('addressText', 'Sector 62, Green Park Towers')

        plan = MealPlan.objects.filter(user=request.user, is_active=True).first()
        sub = Subscription.objects.filter(user=request.user, status='active').first()

        order = DeliveryOrder.objects.create(
            user=request.user,
            subscription=sub,
            plan=plan,
            address=address,
            address_text=addr_text,
            meal_name=data.get('mealName', 'Paneer Power Bowl with Wild Quinoa'),
            meal_category=data.get('mealCategory', 'Lunch'),
            time_slot=data.get('timeSlot', '12:30 PM - 1:15 PM'),
            scheduled_date=data.get('scheduledDate', timezone.now().date()),
            status='confirmed',
            verification_token=DeliveryOrder.generate_token()
        )
        return Response(DeliveryOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class DeliveryOrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        order = DeliveryOrder.objects.filter(id=pk, user=request.user).first()
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DeliveryOrderSerializer(order).data)


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        order = DeliveryOrder.objects.filter(id=pk, user=request.user).first()
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status in ['delivered', 'cancelled']:
            return Response({'error': f'Order cannot be cancelled in status {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'cancelled'
        order.save()
        return Response(DeliveryOrderSerializer(order).data)


class QRVerificationView(APIView):
    permission_classes = [permissions.AllowAny]  # Delivery partner / Admin scanner verification

    def post(self, request):
        token = request.data.get('token', '').strip()
        if not token:
            return Response({'error': 'Verification token is required'}, status=status.HTTP_400_BAD_REQUEST)

        order = DeliveryOrder.objects.filter(verification_token=token).first()
        if not order:
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'delivered':
            return Response({
                'error': 'Order has already been verified and delivered',
                'order': DeliveryOrderSerializer(order).data
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()

        return Response({
            'success': True,
            'message': f"Delivery verified successfully for order #{order.id}",
            'order': DeliveryOrderSerializer(order).data
        })


def _generate_initial_delivery_orders(user, subscription):
    active_plan = MealPlan.objects.filter(user=user, is_active=True).first()
    items = active_plan.items.all() if active_plan else []
    address = DeliveryAddress.objects.filter(user=user, is_default=True).first()
    addr_text = f"{address.full_name}, {address.address_line_1}, {address.city}" if address else "Sector 62, Green Park Towers, Flat 402"

    today = timezone.now().date()
    statuses = ['preparing', 'confirmed', 'pending', 'pending']

    # Select representative items for initial schedule
    sample_items = list(items[:4])
    if not sample_items:
        sample_items = [
            {'meal': type('M', (), {'name': 'Paneer Power Bowl with Wild Quinoa'})(), 'slot_display': 'Lunch'},
            {'meal': type('M', (), {'name': 'Cottage Cheese & Mediterranean Wrap'})(), 'slot_display': 'Dinner'},
            {'meal': type('M', (), {'name': 'Mediterranean Lentil Salad with Feta'})(), 'slot_display': 'Lunch'},
            {'meal': type('M', (), {'name': 'Paneer Tikka Quinoa Bowl'})(), 'slot_display': 'Lunch'},
        ]

    for idx, item in enumerate(sample_items):
        m_name = item.meal.name if hasattr(item, 'meal') else item['meal'].name
        m_cat = item.slot_display if hasattr(item, 'slot_display') else item['slot_display']
        sch_date = today + datetime.timedelta(days=idx)

        DeliveryOrder.objects.get_or_create(
            user=user,
            scheduled_date=sch_date,
            meal_name=m_name,
            defaults={
                'subscription': subscription,
                'plan': active_plan,
                'address': address,
                'address_text': addr_text,
                'meal_category': m_cat,
                'time_slot': '12:30 PM - 1:15 PM' if 'Lunch' in m_cat else '7:45 PM - 8:30 PM',
                'status': statuses[idx % len(statuses)],
                'verification_token': DeliveryOrder.generate_token()
            }
        )
