/**
 * Ambient module declarations for packages that ship without TypeScript types.
 * Keeping these in a single .d.ts file makes them easy to audit and override.
 */

declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    [key: string]: any;
  }
  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }
  export interface RazorpayError {
    code: number | string;
    description: string;
  }
  const RazorpayCheckout: {
    open(
      options: RazorpayOptions,
      success: (response: RazorpayResponse) => void,
      error: (err: RazorpayError) => void
    ): void;
  };
  export default RazorpayCheckout;
}
