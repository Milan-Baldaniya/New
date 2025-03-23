import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, BarChart, PieChart, ChevronUp } from 'lucide-react';

const Analytics = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div>
          <h2 className="text-2xl font-bold relative inline-block">
            Analytics Dashboard
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                  style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
          </h2>
          <p className="text-gray-600 mt-2">Track your sales, orders, and performance metrics.</p>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px] transition-all duration-300 hover:border-farm-green-500">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <LineChart className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231</div>
            <p className="text-xs text-green-500 flex items-center"><ChevronUp className="h-3 w-3" /> 20.1% from last period</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-green-500 flex items-center"><ChevronUp className="h-3 w-3" /> 15.2% from last period</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <PieChart className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹789</div>
            <p className="text-xs text-red-500">-2.1% from last period</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <LineChart className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-green-500 flex items-center"><ChevronUp className="h-3 w-3" /> 0.2 from last period</p>
          </CardContent>
        </Card>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <LineChart className="h-5 w-5 mr-2 text-farm-green-600" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center text-gray-500 transition-all duration-500 hover:text-farm-green-600">
              Sales Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <BarChart className="h-5 w-5 mr-2 text-farm-green-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center text-gray-500 transition-all duration-500 hover:text-farm-green-600">
              Products Chart Placeholder
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`transition-all duration-700 delay-300 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="flex items-center text-farm-green-700">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((item, index) => (
              <div key={item} 
                   className={`flex items-center justify-between p-3 rounded border border-transparent hover:border-farm-green-100 hover:bg-farm-green-50 transition-all duration-300 transform cursor-pointer hover:-translate-x-1`}
                   style={{ transitionDelay: `${index * 100}ms` }}>
                <div>
                  <p className="font-medium">New order received</p>
                  <p className="text-sm text-gray-500">Order #{1000 + item}</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 