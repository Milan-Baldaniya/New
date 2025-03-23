import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, PieChart, LineChart, Plus, Edit, TrendingUp, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";

// Mock data - in a real app this would come from an API
const mockProducts = [
  { id: 1, name: "Organic Apples", stock: 50, sold: 75 },
  { id: 2, name: "Fresh Tomatoes", stock: 30, sold: 40 },
  { id: 3, name: "Organic Honey", stock: 20, sold: 15 },
];

const mockSalesData = [
  { month: "Jan", amount: 400 },
  { month: "Feb", amount: 600 },
  { month: "Mar", amount: 550 },
  { month: "Apr", amount: 700 },
  { month: "May", amount: 900 },
  { month: "Jun", amount: 750 },
];

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [activeListings, setActiveListings] = useState(mockProducts);
  const [salesData, setSalesData] = useState(mockSalesData);
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);
  
  // In a real app, these would be API calls
  useEffect(() => {
    // Fetch active listings
    // Fetch sales data
    
    // Trigger entrance animations
    setIsVisible(true);
    
    // Simple bar chart rendering using DOM
    if (chartRef.current) {
      renderSimpleChart();
    }
  }, []);
  
  const renderSimpleChart = () => {
    const maxAmount = Math.max(...salesData.map(item => item.amount));
    const chartContainer = chartRef.current;
    
    if (!chartContainer) return;
    
    // Clear existing content
    chartContainer.innerHTML = '';
    
    // Create chart
    const chartEl = document.createElement('div');
    chartEl.className = 'flex items-end justify-between h-full w-full pt-4';
    
    salesData.forEach((item, index) => {
      const barHeight = (item.amount / maxAmount) * 100;
      
      const barContainer = document.createElement('div');
      barContainer.className = 'flex flex-col items-center justify-end';
      
      const bar = document.createElement('div');
      bar.className = `bg-farm-green-500 rounded-t-md w-12 opacity-0`;
      bar.style.height = '0px';
      
      // Animate the bars with delay based on index
      setTimeout(() => {
        bar.style.transition = 'height 1s ease, opacity 0.5s ease';
        bar.style.height = `${barHeight}%`;
        bar.style.opacity = '1';
      }, 300 + (index * 150));
      
      const label = document.createElement('div');
      label.className = 'text-xs text-gray-500 mt-2';
      label.textContent = item.month;
      
      const value = document.createElement('div');
      value.className = 'text-xs font-bold mt-1 opacity-0';
      value.textContent = `$${item.amount}`;
      
      // Animate the values with delay
      setTimeout(() => {
        value.style.transition = 'opacity 0.5s ease';
        value.style.opacity = '1';
      }, 800 + (index * 150));
      
      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      barContainer.appendChild(value);
      chartEl.appendChild(barContainer);
    });
    
    chartContainer.appendChild(chartEl);
  };

  return (
    <div className="container p-6 mx-auto">
      <div className={`mb-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-3xl font-bold relative inline-block">
          Welcome, {user?.name}
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h1>
        <p className="text-gray-600 mt-2">Manage your farm products and track sales</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={`transition-all duration-700 delay-200 transform hover:shadow-lg hover:-translate-y-1 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Sales
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-farm-green-100 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
              <BarChart className="h-5 w-5 text-farm-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold animate-count-up" data-value="1240.50">$1,240.50</p>
              <div className="ml-3 flex items-center text-green-500">
                <TrendingUp className="h-4 w-4 mr-1 animate-bounce-subtle" />
                <p className="text-xs">+12% from last month</p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-farm-green-500 rounded-full w-0 transition-all duration-1000" style={{ width: isVisible ? '75%' : '0%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`transition-all duration-700 delay-400 transform hover:shadow-lg hover:-translate-y-1 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Products Sold
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-fresh-blue-100 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
              <PieChart className="h-5 w-5 text-fresh-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold animate-count-up" data-value="130">130</p>
              <div className="ml-3 flex items-center text-green-500">
                <TrendingUp className="h-4 w-4 mr-1 animate-bounce-subtle" />
                <p className="text-xs">+5% from last month</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-4">
              <div className="h-1 bg-farm-green-500 rounded-full w-full transform origin-left transition-transform duration-1000" style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></div>
              <div className="h-1 bg-fresh-blue-500 rounded-full w-full transform origin-left transition-transform duration-1000 delay-300" style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></div>
              <div className="h-1 bg-harvest-gold-500 rounded-full w-full transform origin-left transition-transform duration-1000 delay-600" style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`transition-all duration-700 delay-600 transform hover:shadow-lg hover:-translate-y-1 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Active Auctions
              </CardTitle>
              <CardDescription>Currently running</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-harvest-gold-100 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
              <LineChart className="h-5 w-5 text-harvest-gold-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-2xl font-bold animate-pulse-subtle">2</p>
              <div className="relative ml-4 h-16 w-16">
                <div className="absolute inset-0 bg-harvest-gold-100 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-harvest-gold-200 rounded-full animate-pulse opacity-70" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-harvest-gold-300 rounded-full animate-pulse opacity-90" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-harvest-gold-700">LIVE</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="inventory" className={`space-y-4 transition-all duration-700 delay-800 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <TabsList className="transition-all duration-300 relative">
          <TabsTrigger value="inventory" className="transition-all duration-300 data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-700">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="transition-all duration-300 data-[state=active]:bg-fresh-blue-100 data-[state=active]:text-fresh-blue-700">
            Recent Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all duration-300 data-[state=active]:bg-harvest-gold-100 data-[state=active]:text-harvest-gold-700">
            Analytics
          </TabsTrigger>
          <div className="absolute bottom-0 left-0 h-0.5 bg-gray-200 w-full -z-10"></div>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4 transition-opacity duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Products</h2>
            <Button variant="default" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                Add New Product
              </span>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sold
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeListings.map((product, index) => (
                  <tr 
                    key={product.id}
                    className={`transition-all duration-500 transform hover:bg-gray-50 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-gray-700 mr-2 ${product.stock < 30 ? 'text-red-600 font-medium' : ''}`}>
                          {product.stock} units
                        </div>
                        {product.stock < 30 && (
                          <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{product.sold} units</div>
                      <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-farm-green-500 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: isVisible ? `${Math.min(100, (product.sold / (product.sold + product.stock)) * 100)}%` : '0%',
                            transitionDelay: `${(index * 150) + 500}ms`
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" className="group">
                        <Edit className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                        <span>Edit</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="transition-opacity duration-500">
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="relative">
                  Recent Customer Orders
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-200 transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0"></span>
                </span>
              </h3>
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-300">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">
                  You don't have any recent orders to fulfill.
                </p>
                <Button variant="outline" className="group">
                  <span>Check Again</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="transition-opacity duration-500">
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Sales Analytics</h3>
              <div className="h-80 bg-gray-50 rounded-lg p-4 flex flex-col">
                <div className="flex justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Monthly Sales Performance</h4>
                    <p className="text-xs text-gray-500">Showing data for the first half of 2023</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 group">
                      <span>This Year</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green-500 group-hover:w-full transition-all duration-300"></span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8 opacity-70 hover:opacity-100 transition-opacity">Last Year</Button>
                  </div>
                </div>
                
                <div className="flex-1" ref={chartRef}></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmerDashboard;
