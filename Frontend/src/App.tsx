import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ConsumerDashboard from "@/pages/dashboard/ConsumerDashboard";
import FarmerDashboard from "@/pages/dashboard/FarmerDashboard";
import Marketplace from "@/pages/marketplace/Marketplace";
import ProductDetails from "@/pages/marketplace/ProductDetails";
import LiveBidding from "@/pages/marketplace/LiveBidding";
import FarmerLiveBidding from "@/pages/farmer/LiveBidding";
import Checkout from "@/pages/checkout/Checkout";
import OrderTracking from "@/pages/orders/OrderTracking";
import Chat from "@/pages/chat/Chat";
import AdminPanel from "@/pages/admin/AdminPanel";
import NotFound from "@/pages/NotFound";
import CartPage from "@/pages/cart/CartPage";
import TermsAndConditions from "@/pages/legal/TermsAndConditions";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Profile from "@/pages/farmer/Profile";
import Settings from "@/pages/farmer/Settings";
import Analytics from "@/pages/farmer/Analytics";
import DeliveryPage from "@/pages/farmer/Delivery";
import AddProduct from "@/pages/farmer/AddProduct";
import ConsumerProfile from "@/pages/consumer/Profile";
import ConsumerSettings from "@/pages/consumer/Settings";
import RegisterChoice from "@/pages/auth/RegisterChoice";
import FarmerRegister from "@/pages/auth/FarmerRegister";
import ConsumerRegister from "@/pages/auth/ConsumerRegister";

// Layout components
import MainLayout from "@/components/layouts/MainLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-700 mb-4">
        An error occurred while loading the application.
      </p>
      <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto">
        <pre className="text-sm text-red-800">{error.message}</pre>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Reload Application
      </button>
    </div>
  </div>
);

const App = () => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MarketplaceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/live-bidding/:id" element={<LiveBidding />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/marketplace/:id" element={<Navigate to="/product/:id" replace />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterChoice />} />
                    <Route path="/register/farmer" element={<FarmerRegister />} />
                    <Route path="/register/consumer" element={<ConsumerRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>
                  
                  {/* Protected Consumer Routes */}
                  <Route element={<ProtectedRoute userType="consumer" />}>
                    <Route element={<DashboardLayout userType="consumer" />}>
                      <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
                      <Route path="/consumer/dashboard/profile" element={<ConsumerProfile />} />
                      <Route path="/consumer/dashboard/settings" element={<ConsumerSettings />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders/:id" element={<OrderTracking />} />
                      <Route path="/chat/:id?" element={<Chat />} />
                    </Route>
                  </Route>
                  
                  {/* Protected Farmer Routes */}
                  <Route element={<ProtectedRoute userType="farmer" />}>
                    <Route element={<DashboardLayout userType="farmer" />}>
                      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                      <Route path="/farmer/dashboard/profile" element={<Profile />} />
                      <Route path="/farmer/dashboard/settings" element={<Settings />} />
                      <Route path="/farmer/dashboard/analytics" element={<Analytics />} />
                      <Route path="/farmer/dashboard/delivery" element={<DeliveryPage />} />
                      <Route path="/farmer/dashboard/add-product" element={<AddProduct />} />
                      <Route path="/farmer/dashboard/live-bidding" element={<FarmerLiveBidding />} />
                      <Route path="/farmer/orders/:id" element={<OrderTracking />} />
                      <Route path="/farmer/chat/:id?" element={<Chat />} />
                    </Route>
                  </Route>
                  
                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute userType="admin" />}>
                    <Route path="/admin/*" element={<AdminPanel />} />
                  </Route>
                  
                  {/* Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </MarketplaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
