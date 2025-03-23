import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, ShoppingBag, Package, MessageSquare, 
  User, Settings, LogOut, Plus, Truck, LineChart,
  Gavel
} from "lucide-react";

interface DashboardLayoutProps {
  userType: "consumer" | "farmer";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ userType: propUserType }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [effectiveUserType, setEffectiveUserType] = useState<"consumer" | "farmer">(propUserType);
  
  // Determine the effective user type based on URL path
  useEffect(() => {
    if (location.pathname.includes('/farmer/')) {
      setEffectiveUserType('farmer');
    } else if (location.pathname.includes('/consumer/')) {
      setEffectiveUserType('consumer');
    }
  }, [location.pathname]);

  // Define menu items based on user type
  const getMenuItems = () => {
    const consumerMenuItems = [
      { title: "Dashboard", url: "/consumer/dashboard", icon: Home },
      { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
      { title: "My Orders", url: "/consumer/dashboard?tab=orders", icon: Package },
      { title: "Messages", url: "/chat", icon: MessageSquare },
    ];

    const farmerMenuItems = [
      { title: "Dashboard", url: "/farmer/dashboard", icon: Home },
      { title: "My Products", url: "/farmer/dashboard?tab=products", icon: ShoppingBag },
      { title: "Orders", url: "/farmer/dashboard?tab=orders", icon: Package },
      { title: "Add Product", url: "/farmer/dashboard/add-product", icon: Plus },
      { title: "Live Bidding", url: "/farmer/dashboard/live-bidding", icon: Gavel },
      { title: "Delivery", url: "/farmer/dashboard/delivery", icon: Truck },
      { title: "Analytics", url: "/farmer/dashboard/analytics", icon: LineChart },
      { title: "Messages", url: "/farmer/chat", icon: MessageSquare },
    ];

    return effectiveUserType === "consumer" ? consumerMenuItems : farmerMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider>
        <Sidebar className="bg-farm-green-50 border-r border-farm-green-100">
          <SidebarHeader className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-farm-green-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{user?.name}</span>
                <span className="text-xs text-gray-500 capitalize">{effectiveUserType}</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/${effectiveUserType}/dashboard/profile`} className="flex items-center space-x-3">
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/${effectiveUserType}/dashboard/settings`} className="flex items-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={logout}
                    className="flex items-center space-x-3 text-red-500 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 text-xs text-center text-gray-500">
            <p>© 2023 FarmChain Marketplace</p>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-grow">
          <div className="py-4 px-6 border-b flex justify-between items-center">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">
              {effectiveUserType === "consumer" ? "Consumer Dashboard" : "Farmer Dashboard"}
            </h1>
            <div className="w-10"></div> {/* Empty space for alignment */}
          </div>
          
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
