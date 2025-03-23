import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Heart, Clock, ArrowRight } from "lucide-react";

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const { orders, fetchOrders, isLoading } = useMarketplace();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    fetchOrders();
    // Trigger entrance animations after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, [fetchOrders]);
  
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Get most recent 3 orders
      setRecentOrders(orders.slice(0, 3));
    }
  }, [orders]);

  return (
    <div className="container p-6 mx-auto">
      <div className={`mb-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-3xl font-bold relative inline-block">
          Welcome, {user?.name}
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Manage your orders and discover fresh produce</p>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <CardDescription>Your order history</CardDescription>
            </div>
            <Package className="h-5 w-5 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Saved Items
              </CardTitle>
              <CardDescription>Products you've saved</CardDescription>
            </div>
            <Heart className="h-5 w-5 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Active Bids
              </CardTitle>
              <CardDescription>Items you're bidding on</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="orders" className={`space-y-4 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <TabsList className="transition-all duration-300">
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            Recent Orders
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Recent Orders</h2>
            <Button 
              variant="outline" 
              asChild
              className="group relative overflow-hidden border-farm-green-600 text-farm-green-700 hover:text-farm-green-800 hover:bg-farm-green-50 transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/consumer/orders" className="flex items-center gap-2">
                View All Orders
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <Card 
                  key={order.id} 
                  className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border-transparent hover:border-farm-green-200"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="capitalize px-2 py-0.5 rounded-full bg-farm-green-100 text-farm-green-800">{order.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                        <Button 
                          variant="outline" 
                          asChild 
                          size="sm" 
                          className="mt-2 group transition-all duration-300 hover:bg-farm-green-50 hover:text-farm-green-800 hover:border-farm-green-500"
                        >
                          <Link to={`/orders/${order.id}`} className="flex items-center gap-1">
                            Track Order
                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="transform transition-transform hover:scale-110 duration-300 inline-block mb-4">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-gray-500 mb-4">
                  Browse the marketplace to find fresh produce from local farmers
                </p>
                <Button 
                  asChild
                  className="group relative overflow-hidden bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300"
                >
                  <Link to="/marketplace" className="flex items-center gap-1">
                    <div className="absolute inset-0 w-3 bg-white bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                    Go to Marketplace
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Personalized Recommendations</h3>
              <p className="text-gray-500 mb-4">
                Shop more to get personalized product recommendations based on your preferences.
              </p>
              <Button 
                asChild
                className="group relative overflow-hidden bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300"
              >
                <Link to="/marketplace" className="flex items-center gap-1">
                  <div className="absolute inset-0 w-3 bg-white bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(45deg);
          }
          100% {
            transform: translateX(200%) skewX(45deg);
          }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ConsumerDashboard;
