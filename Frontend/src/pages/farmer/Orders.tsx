import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, Package, Clock, Calendar, Search, Filter, ChevronDown, ChevronUp, 
  CheckCircle, AlertCircle, XCircle, RefreshCw, 
  ArrowUpRight, Eye, Download, Printer, Loader2, CreditCard
} from 'lucide-react';

// Mock data for orders
const orders = [
  {
    id: 'ORD-9876',
    customer: 'Rajiv Mehta',
    date: '2023-11-15',
    total: 2450,
    items: [
      { name: 'Organic Tomatoes', quantity: '2 kg', price: 150 },
      { name: 'Fresh Spinach', quantity: '500 g', price: 80 }
    ],
    status: 'pending',
    paymentMethod: 'Card Payment',
    shippingAddress: '123 Park View Apartments, Anand, Gujarat'
  },
  {
    id: 'ORD-8765',
    customer: 'Priya Sharma',
    date: '2023-11-14',
    total: 1560,
    items: [
      { name: 'Organic Potatoes', quantity: '3 kg', price: 180 },
      { name: 'Farm Fresh Eggs', quantity: '12 pcs', price: 120 }
    ],
    status: 'processing',
    paymentMethod: 'UPI',
    shippingAddress: '456 Green Valley, Nadiad, Gujarat'
  },
  {
    id: 'ORD-7654',
    customer: 'Amit Patel',
    date: '2023-11-13',
    total: 3280,
    items: [
      { name: 'Fresh Milk', quantity: '2 L', price: 120 },
      { name: 'Organic Apples', quantity: '1 kg', price: 220 },
      { name: 'Wheat Flour', quantity: '5 kg', price: 250 }
    ],
    status: 'completed',
    paymentMethod: 'Cash on Delivery',
    shippingAddress: '789 Rural Heights, Vidyanagar, Gujarat'
  },
  {
    id: 'ORD-6543',
    customer: 'Sunita Shah',
    date: '2023-11-12',
    total: 1975,
    items: [
      { name: 'Organic Carrots', quantity: '1 kg', price: 95 },
      { name: 'Fresh Coriander', quantity: '100 g', price: 30 },
      { name: 'Cottage Cheese', quantity: '500 g', price: 175 }
    ],
    status: 'pending',
    paymentMethod: 'UPI',
    shippingAddress: '234 City Center, Anand, Gujarat'
  },
  {
    id: 'ORD-5432',
    customer: 'Vikram Singh',
    date: '2023-11-11',
    total: 4350,
    items: [
      { name: 'Organic Rice', quantity: '10 kg', price: 850 },
      { name: 'Ghee', quantity: '1 L', price: 650 },
      { name: 'Jaggery', quantity: '1 kg', price: 120 }
    ],
    status: 'cancelled',
    paymentMethod: 'Card Payment',
    shippingAddress: '567 Lake View, Baroda, Gujarat'
  },
  {
    id: 'ORD-4321',
    customer: 'Meera Desai',
    date: '2023-11-10',
    total: 2760,
    items: [
      { name: 'Organic Bananas', quantity: '2 dozen', price: 140 },
      { name: 'Fresh Yogurt', quantity: '1 kg', price: 90 }
    ],
    status: 'completed',
    paymentMethod: 'Cash on Delivery',
    shippingAddress: '890 Green Fields, Nadiad, Gujarat'
  }
];

// Helper function to get status styles
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Payment Pending';
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 mr-1.5" />;
    case 'processing':
      return <RefreshCw className="h-4 w-4 mr-1.5 animate-spin-slow" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 mr-1.5" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 mr-1.5" />;
    default:
      return <AlertCircle className="h-4 w-4 mr-1.5" />;
  }
};

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const processOrder = (orderId: string) => {
    setProcessingOrder(orderId);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setProcessingOrder(null);
      // Here you would update the order status via API
    }, 1500);
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pending' && order.status === 'pending') ||
        (activeTab === 'processing' && order.status === 'processing') ||
        (activeTab === 'completed' && order.status === 'completed');

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          Orders Management
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Track and manage your customer orders</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between md:items-center gap-4 transition-all duration-700 delay-100 transform">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
          <Card className={`transition-all duration-300 hover:shadow-md ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <CardContent className="py-4 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-farm-green-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-farm-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`transition-all duration-300 hover:shadow-md ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '100ms' }}>
            <CardContent className="py-4 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{orders.filter(order => order.status === 'pending').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`transition-all duration-300 hover:shadow-md ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '200ms' }}>
            <CardContent className="py-4 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                <p className="text-2xl font-bold">₹{orders.reduce((acc, order) => acc + order.total, 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={`flex flex-col md:flex-row justify-between gap-4 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-farm-green-600 transition-colors duration-300" />
          <Input
            type="search"
            placeholder="Search by order ID or customer name..."
            className="pl-10 focus:border-farm-green-500 focus:ring-farm-green-500 w-full transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="this-week">
            <SelectTrigger className="w-[180px] focus:border-farm-green-500 focus:ring-farm-green-500 transition-all duration-300 hover:border-farm-green-300">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select date range" />
              </div>
            </SelectTrigger>
            <SelectContent className="animate-fade-in-down">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="transition-all duration-300 hover:bg-gray-100 hover:border-farm-green-300 hover:text-farm-green-700 group flex items-center"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Oldest First
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Newest First
              </>
            )}
          </Button>
          <Button variant="outline" className="transition-all duration-300 hover:bg-gray-100 hover:border-farm-green-300 hover:text-farm-green-700 group">
            <Filter className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={`transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger 
            value="all" 
            className="group data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800 relative overflow-hidden"
          >
            <span className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              All Orders
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="group data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800 relative overflow-hidden"
          >
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Pending
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
          <TabsTrigger 
            value="processing" 
            className="group data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800 relative overflow-hidden"
          >
            <span className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Processing
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="group data-[state=active]:bg-green-50 data-[state=active]:text-green-800 relative overflow-hidden"
          >
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Completed
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-green-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="focus-visible:outline-none focus-visible:ring-0">
          <OrderList 
            orders={filteredOrders} 
            expandedOrder={expandedOrder}
            processingOrder={processingOrder}
            toggleOrderDetails={toggleOrderDetails}
            processOrder={processOrder}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface OrderListProps {
  orders: typeof orders;
  expandedOrder: string | null;
  processingOrder: string | null;
  toggleOrderDetails: (orderId: string) => void;
  processOrder: (orderId: string) => void;
  isLoading: boolean;
}

const OrderList = ({ orders, expandedOrder, processingOrder, toggleOrderDetails, processOrder, isLoading }: OrderListProps) => {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card className="overflow-hidden animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-4">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">No orders found</h3>
            <p className="text-gray-500 mb-4">
              There are no orders matching your search criteria.
            </p>
            <Button className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" /> 
                Clear Filters
              </span>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-4 pr-4">
            {orders.map((order, index) => (
              <Card 
                key={order.id} 
                className={`border overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up ${expandedOrder === order.id ? 'shadow-md' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        order.status === 'processing' ? 'bg-blue-100' : 
                        order.status === 'completed' ? 'bg-green-100' : 
                        order.status === 'cancelled' ? 'bg-red-100' : 
                        'bg-amber-100'
                      }`}>
                        <ShoppingCart className={`h-5 w-5 ${
                          order.status === 'processing' ? 'text-blue-700' : 
                          order.status === 'completed' ? 'text-green-700' : 
                          order.status === 'cancelled' ? 'text-red-700' : 
                          'text-amber-700'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          {order.id}
                          <span className="ml-2 text-sm text-gray-500">({order.date})</span>
                        </h3>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={`px-2.5 py-0.5 flex items-center whitespace-nowrap text-xs font-medium border ${getStatusStyles(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                      <span className="text-lg font-semibold">₹{order.total}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      {order.paymentMethod}
                    </span>
                    <span className="flex items-center">
                      <Package className="h-3.5 w-3.5 mx-1" />
                      {order.items.length} items
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleOrderDetails(order.id)}
                      className="text-gray-500 hover:text-farm-green-700 transition-colors duration-300"
                    >
                      {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="transition-all duration-300 hover:border-blue-300 hover:text-blue-700 group"
                          onClick={() => processOrder(order.id)}
                          disabled={isLoading && processingOrder === order.id}
                        >
                          {isLoading && processingOrder === order.id ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                              Process Order
                            </span>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="transition-all duration-300 hover:text-farm-green-700 group"
                      >
                        <Eye className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:scale-110" />
                        <span>View</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in-down">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group hover:bg-white p-2 rounded-md transition-colors duration-300">
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-farm-green-400 mr-2 group-hover:scale-125 transition-transform duration-300"></div>
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">{item.quantity}</span>
                                <span className="text-sm font-medium">₹{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                        <p className="text-sm">{order.shippingAddress}</p>
                      </div>
                      
                      <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" className="transition-colors duration-300 group">
                          <Printer className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:scale-110" />
                          Print Invoice
                        </Button>
                        <Button variant="outline" size="sm" className="transition-colors duration-300 group">
                          <Download className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:scale-110" />
                          Download Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default OrdersPage; 