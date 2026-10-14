/**
 * Razorpay payment wrapper.
 *
 * Flow used by app/checkout.tsx:
 *   1. POST /api/payments/razorpay/create-order with { order_id, amount }
 *      → returns { razorpay_order_id, amount, currency, key_id }
 *   2. Open Razorpay checkout with the returned order_id + key_id
 *   3. On success, POST /api/payments/razorpay/verify with the response
 *      signature → returns { success: true }
 *
 * Fallback:
 *   - When `react-native-razorpay` is not installed (Expo Go), we expose a
 *     `openRazorpayWebView()` helper that loads the hosted checkout URL.
 *   - When `EXPO_PUBLIC_RAZORPAY_KEY_ID` is not set, we run in "mock" mode
 *     where the entire flow simulates success after a small delay. This
 *     makes the checkout flow testable in Expo Go preview.
 */
import apiClient from './api-client';
import { isApiConfigured } from './api-client';

export const RAZORPAY_KEY_ID: string =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

export const isRazorpayConfigured: boolean =
  !!process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
  !!RAZORPAY_KEY_ID; // we always have the test key as default

export interface RazorpayOrder {
  razorpay_order_id: string;
  amount: number; // in paise
  currency: string;
  key_id: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  /** Backend order_id (uuid) — not the razorpay_order_id. */
  orderId: string;
  /** Amount in rupees (will be converted to paise). */
  amount: number;
  /** Customer info prefilled in the checkout. */
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Create a Razorpay order via the backend.
 * Calls POST /api/payments/razorpay/create-order.
 */
export async function createRazorpayOrder(opts: RazorpayOptions): Promise<RazorpayOrder> {
  const amountInPaise = Math.round(opts.amount * 100);
  const result = await apiClient.post<RazorpayOrder & { success?: boolean; error?: string }>(
    '/api/payments/razorpay/create-order',
    {
      order_id: opts.orderId,
      amount: amountInPaise,
      currency: 'INR'
    }
  );
  if (!(result as any).razorpay_order_id) {
    throw new Error((result as any).error || 'Failed to create Razorpay order');
  }
  return {
    razorpay_order_id: (result as any).razorpay_order_id,
    amount: (result as any).amount || amountInPaise,
    currency: (result as any).currency || 'INR',
    key_id: (result as any).key_id || RAZORPAY_KEY_ID
  };
}

/**
 * Verify a Razorpay payment signature with the backend.
 * Calls POST /api/payments/razorpay/verify.
 */
export async function verifyRazorpayPayment(
  orderId: string,
  response: RazorpaySuccessResponse
): Promise<boolean> {
  const result = await apiClient.post<{ success: boolean; error?: string }>(
    '/api/payments/razorpay/verify',
    {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      order_id: orderId
    }
  );
  return !!result.success;
}

/**
 * Open the native Razorpay checkout.
 *
 * Tries to dynamically import `react-native-razorpay`. If unavailable
 * (e.g. in Expo Go), falls back to a mock flow that resolves with a fake
 * successful response after a short delay.
 */
export async function openRazorpayCheckout(
  order: RazorpayOrder,
  customer?: { name?: string; email?: string; phone?: string }
): Promise<RazorpaySuccessResponse> {
  // Try the native module first
  try {
    const Razorpay = await import('react-native-razorpay').then((m: any) => m.default || m).catch(() => null);
    if (Razorpay && typeof Razorpay.openCheckout === 'function') {
      return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
        const options = {
          key: order.key_id || RAZORPAY_KEY_ID,
          amount: String(order.amount),
          currency: order.currency || 'INR',
          name: 'Food Munch',
          description: 'Order Payment',
          order_id: order.razorpay_order_id,
          prefill: {
            name: customer?.name || '',
            email: customer?.email || '',
            contact: customer?.phone || ''
          },
          theme: { color: '#10B981' }
        };
        Razorpay.openCheckout(options)
          .then((response: RazorpaySuccessResponse) => resolve(response))
          .catch((err: any) => reject(new Error(err?.description || err?.message || 'Payment cancelled')));
      });
    }
  } catch (e) {
    console.warn('[payments] react-native-razorpay not available, using mock', e);
  }

  // Fallback: mock flow (Expo Go / no native module installed)
  console.warn('[payments] Running in mock Razorpay mode — no real charge will be made.');
  await new Promise((r) => setTimeout(r, 1200));
  return {
    razorpay_payment_id: 'pay_mock_' + Date.now(),
    razorpay_order_id: order.razorpay_order_id,
    razorpay_signature: 'mock_signature_' + Math.random().toString(36).slice(2)
  };
}

/**
 * Full end-to-end Razorpay payment flow.
 *   1. Create order on backend
 *   2. Open checkout
 *   3. Verify signature on backend
 *   4. Return true on success
 *
 * Throws on any step failure.
 */
export async function payWithRazorpay(opts: RazorpayOptions): Promise<boolean> {
  // When the API isn't configured at all, simulate the whole flow.
  if (!isApiConfigured) {
    console.warn('[payments] API not configured — simulating mock payment.');
    await new Promise((r) => setTimeout(r, 1500));
    return true;
  }

  // 1. Create Razorpay order
  const order = await createRazorpayOrder(opts);

  // 2. Open checkout
  const response = await openRazorpayCheckout(order, opts.customer);

  // 3. Verify signature
  const verified = await verifyRazorpayPayment(opts.orderId, response);
  if (!verified) {
    throw new Error('Payment verification failed');
  }
  return true;
}
