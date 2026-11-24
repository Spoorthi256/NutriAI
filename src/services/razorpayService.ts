/**
 * Razorpay Payment Integration Service for NutriAI
 * Test Key ID: rzp_test_Tkiv94rlfEXazD
 * Test Key Secret: hHW6y830gLmBnhoCLhqvhuZM
 */

export const RAZORPAY_KEY_ID =
  (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tkiv94rlfEXazD';

export interface RazorpayPaymentOptions {
  planTier: 'weekly' | 'monthly' | 'yearly';
  planName: string;
  amountInINR: number;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

// Ensure Razorpay SDK is loaded
export function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout SDK from CDN');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout modal
 */
export async function openRazorpayCheckout(options: RazorpayPaymentOptions): Promise<void> {
  const isLoaded = await loadRazorpaySDK();

  if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
    const errorMsg = 'Razorpay SDK is not loaded. Please ensure you have an active internet connection.';
    console.error(errorMsg);
    if (options.onFailure) {
      options.onFailure(new Error(errorMsg));
    } else {
      alert(errorMsg);
    }
    return;
  }

  const rzpOptions = {
    key: RAZORPAY_KEY_ID,
    amount: options.amountInINR * 100, // Amount in paise
    currency: 'INR',
    name: 'NutriAI',
    description: `${options.planName} (${options.planTier.toUpperCase()}) - Chef Delivery Subscription`,
    image: '/nutriai_logo.png',
    handler: function (response: any) {
      console.log('Razorpay payment successful:', response);
      const paymentId = response?.razorpay_payment_id || `pay_${Date.now()}`;
      options.onSuccess(paymentId);
    },
    prefill: {
      name: options.userName || 'Yuvraj',
      email: options.userEmail || 'yuvraj@nutriai.app',
      contact: options.userPhone || '+919876543210',
    },
    notes: {
      platform: 'NutriAI Precision Nutrition',
      plan: options.planTier,
    },
    theme: {
      color: '#203D32',
      backdrop_color: 'rgba(32, 61, 50, 0.7)',
    },
    modal: {
      ondismiss: function () {
        console.log('Razorpay modal dismissed by user');
        if (options.onFailure) {
          options.onFailure(new Error('Checkout dismissed by user'));
        }
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (resp: any) {
      console.error('Razorpay payment failed:', resp.error);
      if (options.onFailure) {
        options.onFailure(resp.error);
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Failed to open Razorpay checkout instance:', err);
    if (options.onFailure) {
      options.onFailure(err);
    }
  }
}
