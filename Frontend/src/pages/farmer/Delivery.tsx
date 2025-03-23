import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Calendar, Clock, MapPin, User, Search, Filter, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

// Mock data for deliveries
const deliveries = [
  {
    id: 'ORD-1234',
    customer: 'Raj Patel',
    address: '123 Main St, Bangalore',
    status: 'pending',
    items: [
      { name: 'Organic Tomatoes', quantity: '2 kg' },
      { name: 'Fresh Spinach', quantity: '500 g' },
    ],
    date: '2023-11-15',
    time: '10:00 - 12:00',
  },
  {
    id: 'ORD-2345',
    customer: 'Sunita Sharma',
    address: '456 Park Ave, Bangalore',
    status: 'in-transit',
    items: [
      { name: 'Organic Potatoes', quantity: '3 kg' },
      { name: 'Carrots', quantity: '1 kg' },
    ],
    date: '2023-11-15',
    time: '14:00 - 16:00',
  },
  {
    id: 'ORD-3456',
    customer: 'Anish Kumar',
    address: '789 Garden St, Bangalore',
    status: 'completed',
    items: [
      { name: 'Apples', quantity: '2 kg' },
      { name: 'Oranges', quantity: '1.5 kg' },
    ],
    date: '2023-11-14',
    time: '09:00 - 11:00',
  },
  {
    id: 'ORD-4567',
    customer: 'Priya Singh',
    address: '234 Tree Lane, Bangalore',
    status: 'pending',
    items: [
      { name: 'Eggplant', quantity: '1 kg' },
      { name: 'Bell Peppers', quantity: '500 g' },
    ],
    date: '2023-11-16',
    time: '11:00 - 13:00',
  },
  {
    id: 'ORD-5678',
    customer: 'Vivek Gupta',
    address: '567 Flower Rd, Bangalore',
    status: 'in-transit',
    items: [
      { name: 'Cucumber', quantity: '1 kg' },
      { name: 'Onions', quantity: '2 kg' },
    ],
    date: '2023-11-15',
    time: '15:00 - 17:00',
  },
];

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'in-transit':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Scheduled';
    case 'in-transit':
      return 'In Transit';
    case 'completed':
      return 'Delivered';
    default:
      return 'Unknown';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Calendar className="h-4 w-4 mr-1.5" />;
    case 'in-transit':
      return <Truck className="h-4 w-4 mr-1.5 animate-pulse" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 mr-1.5" />;
    default:
      return <AlertTriangle className="h-4 w-4 mr-1.5" />;
  }
};

const DeliveryPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      (activeTab === 'upcoming' && delivery.status === 'pending') ||
      (activeTab === 'in-transit' && delivery.status === 'in-transit') ||
      (activeTab === 'completed' && delivery.status === 'completed');

    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = (id: string) => {
    setSelectedDelivery(id);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setSelectedDelivery(null);
      // Here you would update the delivery status via API
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          Delivery Management
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Track and manage your product deliveries</p>
      </div>

      <div className={`flex flex-col md:flex-row justify-between gap-4 transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-farm-green-600 transition-colors duration-300" />
          <Input
            type="search"
            placeholder="Search by order ID, customer or address..."
            className="pl-10 focus:border-farm-green-500 focus:ring-farm-green-500 w-full transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px] focus:border-farm-green-500 focus:ring-farm-green-500 transition-all duration-300 hover:border-farm-green-300">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select date" />
              </div>
            </SelectTrigger>
            <SelectContent className="animate-fade-in-down">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="transition-all duration-300 hover:bg-gray-100 hover:border-farm-green-300 hover:text-farm-green-700 group">
            <Filter className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={`transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger 
            value="upcoming" 
            className="group data-[state=active]:bg-farm-green-50 data-[state=active]:text-farm-green-700 relative overflow-hidden"
          >
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Upcoming
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-farm-green-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
          <TabsTrigger 
            value="in-transit" 
            className="group data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 relative overflow-hidden"
          >
            <span className="flex items-center">
              <Truck className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              In Transit
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="group data-[state=active]:bg-green-50 data-[state=active]:text-green-700 relative overflow-hidden"
          >
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Completed
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-green-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <DeliveryList 
            deliveries={filteredDeliveries} 
            activeTab={activeTab} 
            selectedDelivery={selectedDelivery}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="in-transit">
          <DeliveryList 
            deliveries={filteredDeliveries} 
            activeTab={activeTab}
            selectedDelivery={selectedDelivery}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="completed">
          <DeliveryList 
            deliveries={filteredDeliveries} 
            activeTab={activeTab}
            selectedDelivery={selectedDelivery}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DeliveryListProps {
  deliveries: typeof deliveries;
  activeTab: string;
  selectedDelivery: string | null;
  isLoading: boolean;
  onUpdateStatus: (id: string) => void;
}

const DeliveryList = ({ deliveries, activeTab, selectedDelivery, isLoading, onUpdateStatus }: DeliveryListProps) => {
  return (
    <div className="space-y-4">
      {deliveries.length === 0 ? (
        <Card className="overflow-hidden animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">No deliveries found</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'upcoming'
                ? 'You have no upcoming deliveries scheduled.'
                : activeTab === 'in-transit'
                ? 'You have no deliveries currently in transit.'
                : 'You have no completed deliveries in this period.'}
            </p>
            <Button className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Package className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> 
                Create New Delivery
              </span>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-270px)]">
          <div className="space-y-4 pr-4">
            {deliveries.map((delivery, index) => (
              <Card 
                key={delivery.id} 
                className={`border overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${delivery.status === 'in-transit' ? 'bg-blue-100' : delivery.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Truck className={`h-5 w-5 ${delivery.status === 'in-transit' ? 'text-blue-700 animate-pulse' : delivery.status === 'completed' ? 'text-green-700' : 'text-amber-700'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{delivery.id}</h3>
                        <p className="text-sm text-gray-500">{delivery.date}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`px-2.5 py-0.5 flex items-center whitespace-nowrap text-xs font-medium border ${getStatusColor(delivery.status)}`}
                    >
                      {getStatusIcon(delivery.status)}
                      {getStatusText(delivery.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="space-y-2 md:col-span-4">
                      <div className="text-sm font-medium text-gray-500">Customer</div>
                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{delivery.customer}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-4">
                      <div className="text-sm font-medium text-gray-500">Delivery Time</div>
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{delivery.time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-4">
                      <div className="text-sm font-medium text-gray-500">Address</div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{delivery.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Items</div>
                    <div className="space-y-2">
                      {delivery.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-farm-green-400 mr-2 group-hover:scale-125 transition-transform duration-300"></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    {delivery.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        className="transition-all duration-300 hover:border-blue-300 hover:text-blue-700 group"
                        onClick={() => onUpdateStatus(delivery.id)}
                        disabled={isLoading && selectedDelivery === delivery.id}
                      >
                        {isLoading && selectedDelivery === delivery.id ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Truck className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            Mark as In Transit
                          </span>
                        )}
                      </Button>
                    )}
                    
                    {delivery.status === 'in-transit' && (
                      <Button 
                        variant="outline" 
                        className="transition-all duration-300 hover:border-green-300 hover:text-green-700 group"
                        onClick={() => onUpdateStatus(delivery.id)}
                        disabled={isLoading && selectedDelivery === delivery.id}
                      >
                        {isLoading && selectedDelivery === delivery.id ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                            Mark as Delivered
                          </span>
                        )}
                      </Button>
                    )}
                    
                    <Button variant="outline" className="transition-all duration-300 hover:bg-gray-100 group">
                      <span className="flex items-center">
                        <Package className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        View Details
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DeliveryPage; 