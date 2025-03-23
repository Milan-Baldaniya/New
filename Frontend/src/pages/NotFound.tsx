
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-farm-green-100 flex items-center justify-center">
            <span className="text-4xl text-farm-green-600">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Need help? <Link to="/contact" className="text-farm-green-600 hover:underline">Contact our support team</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
