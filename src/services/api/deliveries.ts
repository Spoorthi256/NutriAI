import { apiRequest } from './client';

export interface DeliveryAddressData {
  id?: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface DeliveryOrderData {
  id: number;
  deliveryDate: string;
  mealName: string;
  mealCategory: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  addressText: string;
  verificationToken: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface SubscriptionData {
  id: number;
  status: 'active' | 'pending' | 'paused' | 'cancelled' | 'expired';
  tier: 'basic' | 'premium';
  billingFrequency: 'weekly' | 'monthly';
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

export async function fetchSubscription() {
  return apiRequest<SubscriptionData>('/deliveries/subscription/');
}

export async function createPaymentOrder(tier: 'basic' | 'premium', billingFrequency: 'weekly' | 'monthly') {
  return apiRequest<{
    orderId: string;
    amount: number;
    amountInr: number;
    currency: string;
    keyId: string;
    tier: string;
    billingFrequency: string;
  }>('/deliveries/subscription/create-payment/', {
    method: 'POST',
    body: JSON.stringify({ tier, billingFrequency }),
  });
}

export async function verifyPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  tier: 'basic' | 'premium';
  billingFrequency: 'weekly' | 'monthly';
}) {
  return apiRequest<{
    subscription: SubscriptionData;
    orders: DeliveryOrderData[];
    message: string;
  }>('/deliveries/subscription/verify-payment/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelSubscription() {
  return apiRequest<SubscriptionData>('/deliveries/subscription/cancel/', {
    method: 'POST',
  });
}

export async function fetchAddresses() {
  return apiRequest<DeliveryAddressData[]>('/deliveries/addresses/');
}

export async function createAddress(data: DeliveryAddressData) {
  return apiRequest<DeliveryAddressData>('/deliveries/addresses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAddress(id: number, data: Partial<DeliveryAddressData>) {
  return apiRequest<DeliveryAddressData>(`/deliveries/addresses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: number) {
  return apiRequest(`/deliveries/addresses/${id}/`, {
    method: 'DELETE',
  });
}

export async function fetchDeliveryOrders() {
  return apiRequest<DeliveryOrderData[]>('/deliveries/orders/');
}

export async function createDeliveryOrder(payload: {
  addressId?: number;
  addressText?: string;
  mealName: string;
  mealCategory: string;
  timeSlot?: string;
  scheduledDate?: string;
}) {
  return apiRequest<DeliveryOrderData>('/deliveries/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelDeliveryOrder(id: number) {
  return apiRequest<DeliveryOrderData>(`/deliveries/orders/${id}/cancel/`, {
    method: 'POST',
  });
}

export async function verifyQRToken(token: string) {
  return apiRequest<{ success: boolean; message: string; order: DeliveryOrderData }>('/deliveries/verify/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
