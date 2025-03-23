import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Sprout, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegisterChoice = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-40 h-80 w-80 bg-farm-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-0 -right-40 h-80 w-80 bg-fresh-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
      <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-harvest-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
    
      <div className={`relative z-10 space-y-6 backdrop-blur-sm bg-white/95 p-8 rounded-xl shadow-2xl border border-white/50 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-farm-green-400 to-fresh-blue-600 rounded-full flex items-center justify-center mb-4 animate-morph">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-farm-green-600 to-fresh-blue-600 transition-all duration-500 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Join Our Community
          </h1>
          <p className={`text-gray-500 mt-2 transition-all duration-500 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Choose how you want to participate in our marketplace
          </p>
        </div>
        
        <div className={`space-y-4 transition-all duration-500 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">I want to register as a:</h2>
          </div>
          
          <Link to="/register/farmer" className="block">
            <div className="border border-farm-green-200 hover:border-farm-green-500 rounded-lg p-6 transition-all duration-300 hover:shadow-md bg-gradient-to-r from-white to-farm-green-50 group">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-farm-green-100 flex items-center justify-center group-hover:bg-farm-green-200 transition-colors">
                  <Sprout className="h-6 w-6 text-farm-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-farm-green-700">Farmer</h3>
                  <p className="text-sm text-gray-500">Sell your fresh produce directly to consumers</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/register/consumer" className="block">
            <div className="border border-fresh-blue-200 hover:border-fresh-blue-500 rounded-lg p-6 transition-all duration-300 hover:shadow-md bg-gradient-to-r from-white to-fresh-blue-50 group">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-fresh-blue-100 flex items-center justify-center group-hover:bg-fresh-blue-200 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-fresh-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-fresh-blue-700">Consumer</h3>
                  <p className="text-sm text-gray-500">Buy fresh produce directly from local farmers</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        <div className={`text-center transition-all duration-500 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-gray-700 hover:text-gray-900 transition-colors relative inline-block group"
            >
              Sign in
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-700 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoice; 