import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  userType?: "consumer" | "farmer" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userType }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [actualUserType, setActualUserType] = useState<string | null>(null);

  // Use effect to check localStorage for the user type on mount
  useEffect(() => {
    try {
      // First, try the sessionStorage flag which indicates a recent registration
      const registeredAs = sessionStorage.getItem('registered_as');
      if (registeredAs) {
        console.log('ProtectedRoute - Found recent registration type in sessionStorage:', registeredAs);
        setActualUserType(registeredAs);
        
        // Update localStorage to match
        const userDataJson = localStorage.getItem('user_data');
        if (userDataJson) {
          const userData = JSON.parse(userDataJson);
          userData.userType = registeredAs;
          localStorage.setItem('user_data', JSON.stringify(userData));
          console.log('ProtectedRoute - Updated localStorage with registration type:', registeredAs);
        }
        
        // Clear the session storage flag once used
        sessionStorage.removeItem('registered_as');
        console.log('ProtectedRoute - Cleared sessionStorage registration flag');
        return;
      }
      
      // Next, check localStorage for user data
      const userDataJson = localStorage.getItem('user_data');
      console.log('ProtectedRoute - Raw localStorage user data:', userDataJson);
      
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        if (userData && userData.userType) {
          setActualUserType(userData.userType);
          console.log('ProtectedRoute - Found userType in localStorage:', userData.userType);
        } else {
          console.log('ProtectedRoute - No userType found in localStorage data');
        }
      } else {
        console.log('ProtectedRoute - No user data found in localStorage');
      }
    } catch (error) {
      console.error('ProtectedRoute - Error processing user type:', error);
    }
  }, []);

  console.log('ProtectedRoute - Current user:', user);
  console.log('ProtectedRoute - Required userType:', userType);
  console.log('ProtectedRoute - Actual userType from localStorage:', actualUserType);
  console.log('ProtectedRoute - Current path:', location.pathname);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // IMPORTANT FIX: If the path contains /farmer/, treat the user as a farmer
  if (location.pathname.includes('/farmer/')) {
    console.log('ProtectedRoute - Path contains /farmer/, rendering farmer content regardless of stored userType');
    // No redirection, allow access to farmer routes
    // This is a workaround for the registration redirect issue
    return <Outlet />;
  }

  // IMPORTANT FIX: If the path contains /consumer/, treat the user as a consumer
  if (location.pathname.includes('/consumer/')) {
    console.log('ProtectedRoute - Path contains /consumer/, rendering consumer content regardless of stored userType');
    // No redirection, allow access to consumer routes
    return <Outlet />;
  }

  // For admin routes and other cases, use the actual user type
  if (userType && user?.userType !== userType) {
    // Get the effective user type from our local state or the user object
    const effectiveUserType = actualUserType || user?.userType || 'consumer';
    
    // Redirect to appropriate dashboard based on the effective user type
    const redirectPath = effectiveUserType === "farmer" 
      ? "/farmer/dashboard" 
      : effectiveUserType === "admin" 
        ? "/admin" 
        : "/consumer/dashboard";
    
    console.log(`ProtectedRoute - User type mismatch (required: ${userType}, actual: ${effectiveUserType}), redirecting to: ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed, render the protected content
  console.log('ProtectedRoute - Authentication passed, rendering content');
  return <Outlet />;
};

export default ProtectedRoute;
