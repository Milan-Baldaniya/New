import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Check, CreditCard, Truck, Home, Calendar } from "lucide-react";
import StripePaymentForm from "@/components/StripePaymentForm";

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PaymentInfo {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, createOrder, clearCart, processPayment } = useMarketplace();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "confirmation">("cart");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "paypal">("credit");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleNextStep = () => {
    if (step === "cart") {
      setStep("shipping");
    } else if (step === "shipping") {
      // Validate shipping info
      if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || 
          !shippingInfo.state || !shippingInfo.zipCode) {
        toast({
          title: "Missing information",
          description: "Please fill in all required shipping fields",
          variant: "destructive",
        });
        return;
      }
      setStep("payment");
    }
    // Payment confirmation is now handled by the StripePaymentForm component
  };
  
  const handlePlaceOrder = async (paymentIntentId?: string) => {
    try {
      const orderId = await createOrder(paymentIntentId);
      if (orderId) {
        setStep("confirmation");
        toast({
          title: "Order placed successfully",
          description: "Your order has been placed and is being processed.",
        });
        // Redirect to order tracking after a delay
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    handlePlaceOrder(paymentIntentId);
  };
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = shippingMethod === "express" ? 9.99 : 4.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;
  
  // Check if cart is empty
  if (cart.length === 0 && step === "cart") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <p className="text-gray-500 mb-6 text-center">
              There are no items in your shopping cart.
            </p>
            <Button onClick={() => navigate("/marketplace")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment section rendering
  const renderPaymentSection = () => {
    if (paymentMethod === "credit") {
      return (
        <StripePaymentForm
          amount={total}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setStep("shipping")}
          isProcessing={isProcessingPayment}
          setIsProcessing={setIsProcessingPayment}
        />
      );
    } else if (paymentMethod === "paypal") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>PayPal Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center py-8">
              You will be redirected to PayPal to complete your payment.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("shipping")}>
              Back
            </Button>
            <Button onClick={() => {
              // Mock PayPal payment for demo
              toast({
                title: "PayPal integration",
                description: "PayPal integration would be implemented here. Proceeding with order.",
              });
              handlePlaceOrder("paypal_mock_payment");
            }}>
              Continue to PayPal
            </Button>
          </CardFooter>
        </Card>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step === "cart" || step === "shipping" || step === "payment" || step === "confirmation" 
                  ? "bg-farm-green-500 text-white" 
                  : "bg-gray-200"
              }`}>
                {step === "cart" || step === "shipping" || step === "payment" || step === "confirmation" ? <Check size={16} /> : 1}
              </div>
              <span className="text-sm mt-1">Cart</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className={`h-full ${
                step === "shipping" || step === "payment" || step === "confirmation" ? "bg-farm-green-500" : "bg-gray-200"
              }`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step === "shipping" || step === "payment" || step === "confirmation" 
                  ? "bg-farm-green-500 text-white" 
                  : "bg-gray-200"
              }`}>
                {step === "shipping" || step === "payment" || step === "confirmation" ? <Check size={16} /> : 2}
              </div>
              <span className="text-sm mt-1">Shipping</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className={`h-full ${
                step === "payment" || step === "confirmation" ? "bg-farm-green-500" : "bg-gray-200"
              }`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step === "payment" || step === "confirmation"
                  ? "bg-farm-green-500 text-white" 
                  : "bg-gray-200"
              }`}>
                {step === "payment" || step === "confirmation" ? <Check size={16} /> : 3}
              </div>
              <span className="text-sm mt-1">Payment</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className={`h-full ${
                step === "confirmation" ? "bg-farm-green-500" : "bg-gray-200"
              }`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step === "confirmation"
                  ? "bg-farm-green-500 text-white" 
                  : "bg-gray-200"
              }`}>
                {step === "confirmation" ? <Check size={16} /> : 4}
              </div>
              <span className="text-sm mt-1">Confirmation</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content (Cart, Shipping, Payment) */}
          <div className="md:col-span-2">
            {step === "cart" && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Shopping Cart</CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between py-3 border-b">
                      <div className="flex">
                        <div className="h-16 w-16 rounded overflow-hidden mr-4">
                          <img 
                            src={item.product.images[0] || "/placeholder.svg"} 
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/marketplace")}>
                    Continue Shopping
                  </Button>
                  <Button onClick={handleNextStep}>
                    Proceed to Shipping
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {step === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        value={shippingInfo.fullName}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={shippingInfo.state}
                          onChange={handleShippingInfoChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input 
                          id="zipCode" 
                          name="zipCode" 
                          value={shippingInfo.zipCode}
                          onChange={handleShippingInfoChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <Label className="mb-2 block">Shipping Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as "standard" | "express")}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 mb-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-farm-green-500" />
                              <span>Standard Shipping (3-5 business days)</span>
                            </div>
                            <span className="font-medium">$4.99</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-farm-green-500" />
                              <span>Express Shipping (1-2 business days)</span>
                            </div>
                            <span className="font-medium">$9.99</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("cart")}>
                    Back to Cart
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "credit" | "paypal")}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 mb-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-farm-green-500" />
                          <span>Credit or Debit Card</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <span className="font-bold text-blue-700 mr-1">Pay</span>
                          <span className="font-bold text-blue-900">Pal</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Render the appropriate payment form based on selected method */}
                  <div className="mt-6">
                    {renderPaymentSection()}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {step === "confirmation" && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-6">
                    Your order has been placed and is being processed.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate("/marketplace")}>
                      Continue Shopping
                    </Button>
                    <Button onClick={() => navigate("/consumer/dashboard")}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {step === "shipping" && (
                  <div className="pt-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <Home className="h-4 w-4 mr-2" />
                      <span className="text-sm">Delivery Address:</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {shippingInfo.address ? (
                        <>
                          <p>{shippingInfo.fullName}</p>
                          <p>{shippingInfo.address}</p>
                          <p>
                            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Please enter your shipping address</p>
                      )}
                    </div>
                  </div>
                )}
                
                {step === "payment" && (
                  <div className="pt-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Estimated Delivery:</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {shippingMethod === "express" ? (
                        <p>1-2 business days from order confirmation</p>
                      ) : (
                        <p>3-5 business days from order confirmation</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
