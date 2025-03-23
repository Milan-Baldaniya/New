import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Package, Calendar, MapPin, CheckCircle2, Clock } from "lucide-react";

interface Order {
  id: string;
  userId: string;
  items: any[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  trackingInfo?: {
    estimatedDelivery: string;
    currentLocation: string;
    updates: {
      status: string;
      timestamp: string;
      description: string;
    }[];
  };
}

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xl mb-4">Order not found</p>
            <Button asChild>
              <Link to="/consumer/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "text-orange-500";
      case 'processing':
        return "text-blue-500";
      case 'shipped':
        return "text-indigo-500";
      case 'delivered':
        return "text-green-500";
      case 'cancelled':
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  const getStatusPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "25%";
      case 'processing':
        return "50%";
      case 'shipped':
        return "75%";
      case 'delivered':
        return "100%";
      case 'cancelled':
        return "0%";
      default:
        return "0%";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
          <Button variant="outline" asChild>
            <Link to="/consumer/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Tracking */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order Placed</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-farm-green-500 transition-all duration-500 ease-in-out`}
                      style={{ width: getStatusPercentage(order.status) }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      <span className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Estimated Delivery: {order.trackingInfo?.estimatedDelivery ? 
                        new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Current Location */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-farm-green-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">Current Location</p>
                      <p className="text-gray-600">{order.trackingInfo?.currentLocation || 'Processing center'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tracking Timeline */}
                <div className="space-y-4">
                  <h3 className="font-medium">Tracking History</h3>
                  <div className="space-y-4">
                    {order.trackingInfo?.updates ? (
                      [...order.trackingInfo.updates].reverse().map((update, idx) => (
                        <div key={idx} className="flex">
                          <div className="mr-4 relative">
                            <div className="h-4 w-4 rounded-full bg-farm-green-500 mt-1"></div>
                            {idx !== order.trackingInfo!.updates.length - 1 && (
                              <div className="absolute top-5 bottom-0 left-1.5 w-0.5 -ml-px bg-gray-200"></div>
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="font-medium">{update.status}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                            <p className="text-gray-600 mt-1">{update.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No tracking updates available yet.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-4 border-b last:border-0">
                    <div className="flex">
                      <div className="h-16 w-16 rounded overflow-hidden mr-4">
                        <img 
                          src={item.product.images?.[0] || "/placeholder.jpg"} 
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${(order.totalAmount * 0.92).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>$4.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/chat/${order.id}`}>
                    Message Farmer
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {order.status === "delivered" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <span className="font-medium">Delivery Status</span>
                  </div>
                  <span className={`capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {order.status === "delivered" 
                        ? "Delivered on " + new Date(order.trackingInfo?.updates.slice(-1)[0]?.timestamp || "").toLocaleDateString()
                        : "Expected delivery by " + new Date(order.trackingInfo?.estimatedDelivery || "").toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
