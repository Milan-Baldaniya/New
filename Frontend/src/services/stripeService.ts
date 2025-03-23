// Mock Stripe service - would be replaced with real API calls in production

// Simulates API calls to backend server which would handle Stripe API for security
// In a real implementation, we wouldn't expose API keys client-side

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency?: string;
  description?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const stripeService = {
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
    // Simulate API delay
    await delay(800);
    
    // In a real implementation, this would be a call to your backend server
    // which would create a payment intent with Stripe's API
    
    // Mock response data
    const mockId = `pi_${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
    const mockSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id: mockId,
      clientSecret: mockSecret,
      amount: data.amount,
      currency: data.currency || 'usd',
      status: 'requires_payment_method'
    };
  },
  
  confirmPayment: async (paymentIntentId: string): Promise<{ success: boolean; status: string }> => {
    // Simulate API delay
    await delay(500);
    
    // In a real implementation, this would check with your backend about payment status
    
    // Simulate successful payment 90% of the time
    const success = Math.random() < 0.9;
    
    return {
      success,
      status: success ? 'succeeded' : 'failed'
    };
  }
}; 