
import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBasket, 
  Settings as SettingsIcon, 
  BarChart, 
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Admin Dashboard Components
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <CardDescription>All registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">1,286</p>
          <p className="text-xs text-green-500">+12% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">$34,242</p>
          <p className="text-xs text-green-500">+8% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <CardDescription>Products in marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">432</p>
          <p className="text-xs text-green-500">+24 new this week</p>
        </CardContent>
      </Card>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm font-medium text-gray-500">
              <span>Order ID</span>
              <span>Customer</span>
              <span className="text-right">Amount</span>
            </div>
            <Separator />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-3 text-sm">
                <span className="font-mono">#ORD-{1000 + i}</span>
                <span>Customer {i}</span>
                <span className="text-right font-medium">${(Math.random() * 100 + 20).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm font-medium text-gray-500">
              <span>Product</span>
              <span>Farmer</span>
              <span className="text-right">Sales</span>
            </div>
            <Separator />
            {["Organic Apples", "Fresh Tomatoes", "Organic Honey", "Premium Beef", "Fresh Farm Eggs"].map((product, i) => (
              <div key={i} className="grid grid-cols-3 text-sm">
                <span>{product}</span>
                <span>Farmer {i + 1}</span>
                <span className="text-right font-medium">${(Math.random() * 1000 + 500).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const UserManagement = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">User Management</h1>
    <Card>
      <CardContent className="p-6">
        <p>User management interface will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
);

const ProductManagement = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Product Management</h1>
    <Card>
      <CardContent className="p-6">
        <p>Product management interface will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
);

const Reports = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
    <Card>
      <CardContent className="p-6">
        <p>Reports and analytics will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
);

const Settings = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Settings</h1>
    <Card>
      <CardContent className="p-6">
        <p>Settings interface will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
);

// Main Admin Panel Component
const AdminPanel = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: ShoppingBasket },
    { name: "Reports", href: "/admin/reports", icon: BarChart },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile menu button */}
      <div className="md:hidden mb-6">
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>Admin Menu</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {navigation.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link 
                  to={item.href}
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-56">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href || 
                      (item.href === "/admin" && location.pathname === "/admin/")
                        ? "bg-farm-green-50 text-farm-green-600" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <Separator className="my-4" />
              
              <div className="px-3 py-2">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                  <HelpCircle className="h-5 w-5 mr-3" />
                  Help & Support
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
        
        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
