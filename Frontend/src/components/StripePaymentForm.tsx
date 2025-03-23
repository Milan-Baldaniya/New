import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StripePaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onCancel,
  isProcessing,
  setIsProcessing
}) => {
  const { toast } = useToast();
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardHolder: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setIsProcessing(true);

    try {
      // Validate card details (very basic validation)
      if (!cardDetails.cardNumber || !cardDetails.expDate || !cardDetails.cvc || !cardDetails.cardHolder) {
        toast({
          title: "Missing information",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // For testing, we'll use a mock payment ID
      const mockPaymentIntentId = `pi_${Date.now()}`;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Just proceed with the payment success flow
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      });
      
      // Call the success callback with the payment intent ID
      onPaymentSuccess(mockPaymentIntentId);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input
                id="cardHolder"
                name="cardHolder"
                placeholder="John Doe"
                value={cardDetails.cardHolder}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardDetails.cardNumber}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expDate">Expiry Date</Label>
                <Input
                  id="expDate"
                  name="expDate"
                  placeholder="MM/YY"
                  value={cardDetails.expDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  name="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Test card: 4242 4242 4242 4242</p>
            <p>Exp: Any future date (MM/YY) | CVC: Any 3 digits</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StripePaymentForm; 