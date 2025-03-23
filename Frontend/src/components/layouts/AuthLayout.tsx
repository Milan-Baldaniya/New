
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users
  if (isAuthenticated && user) {
    const redirectPath = user.userType === "farmer" 
      ? "/farmer/dashboard" 
      : "/consumer/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-farm-green-600 font-display text-xl font-semibold">
            FarmChain Marketplace
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2023 FarmChain Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
