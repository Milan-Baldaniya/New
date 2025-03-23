import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import ProductCard from "@/components/products/ProductCard";
import { FancySpinner } from "@/components/ui/fancy-spinner";
import { ArrowRight, ShieldCheck, Truck, Leaf, Clock, ChevronRight, Star } from "lucide-react";
import AnimatedHeroBackground from "@/components/ui/animated-hero-background";

const Home = () => {
  const { featuredProducts, fetchProducts, isLoading } = useMarketplace();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
    setHeroVisible(true);
  }, [fetchProducts]);

  return (
    <div>
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        <AnimatedHeroBackground />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="text-center">
            <div className={`transition-all duration-1000 transform ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up drop-shadow-lg">
                Fresh Farm Products Delivered to Your Doorstep
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 animate-fade-in-up drop-shadow-md" style={{ animationDelay: '100ms' }}>
                Shop directly from local farmers for the freshest produce with transparent 
                pricing and blockchain-verified authenticity.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <AnimatedButton variant="glowing" size="xl" asChild>
                  <Link to="/marketplace">Shop Now</Link>
                </AnimatedButton>
                <AnimatedButton variant="neon" size="xl" asChild>
                  <Link to="/about">Learn More</Link>
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Morph Animations */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 animate-fade-in-up">Why Choose FarmChain?</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">Experience the future of farm-to-table with our innovative blockchain platform</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transition-all duration-300 hover:shadow-lg hover:border-gray-200" style={{ animationDelay: '100ms' }}>
              <div className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center group relative animated-border">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-pulse-subtle"></div>
                <Leaf className="h-10 w-10 text-farm-green-600 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-farm-green-600 transition-colors">Sustainable Farming</h3>
              <p className="text-gray-600 mb-6">
                Support eco-friendly farming practices that preserve our environment for future generations.
              </p>
              <Link to="/about#sustainability" className="text-farm-green-600 font-medium inline-flex items-center hover:underline">
                Learn more <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transition-all duration-300 hover:shadow-lg hover:border-gray-200" style={{ animationDelay: '200ms' }}>
              <div className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center group relative animated-border">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full animate-pulse-subtle"></div>
                <ShieldCheck className="h-10 w-10 text-fresh-blue-600 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:animate-pulse-subtle" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-fresh-blue-600 transition-colors">Blockchain Verified</h3>
              <p className="text-gray-600 mb-6">
                Every product is tracked on blockchain for complete transparency from farm to table.
              </p>
              <Link to="/about#blockchain" className="text-fresh-blue-600 font-medium inline-flex items-center hover:underline">
                Learn more <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transition-all duration-300 hover:shadow-lg hover:border-gray-200" style={{ animationDelay: '300ms' }}>
              <div className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center group relative animated-border">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full animate-pulse-subtle"></div>
                <Truck className="h-10 w-10 text-harvest-gold-600 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:animate-bounce-subtle" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-harvest-gold-600 transition-colors">Fast Delivery</h3>
              <p className="text-gray-600 mb-6">
                Get fresh produce delivered to your doorstep quickly with our efficient logistics.
              </p>
              <Link to="/about#delivery" className="text-harvest-gold-600 font-medium inline-flex items-center hover:underline">
                Learn more <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transition-all duration-300 hover:shadow-lg hover:border-gray-200" style={{ animationDelay: '400ms' }}>
              <div className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center group relative animated-border">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full animate-pulse-subtle"></div>
                <Star className="h-10 w-10 text-soil-brown-600 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:animate-rotate-360" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-soil-brown-600 transition-colors">Premium Quality</h3>
              <p className="text-gray-600 mb-6">
                Discover the best seasonal produce available, fresh from the farm at its peak flavor.
              </p>
              <Link to="/about#quality" className="text-soil-brown-600 font-medium inline-flex items-center hover:underline">
                Learn more <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products with Animation */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold animate-fade-in-up">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mt-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Handpicked selection of our best seasonal offerings
              </p>
            </div>
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-800 font-medium flex items-center group animate-fade-in-up bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
              View All <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FancySpinner variant="morph" size="lg" primaryColor="farm-green-500" />
              <p className="mt-6 text-gray-600 animate-pulse-subtle">Loading delicious products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 150}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section with Impressive Animation */}
      <div className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden wavy-background">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">Ready to taste the difference?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Join thousands of happy customers who enjoy fresh, farm-to-table produce every day.
          </p>
          <div className="flex justify-center space-x-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <AnimatedButton asChild variant="liquid" size="xl">
              <Link to="/marketplace">Start Shopping</Link>
            </AnimatedButton>
            <AnimatedButton asChild variant="neon" size="xl">
              <Link to="/register">Create Account</Link>
            </AnimatedButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <p className="text-2xl font-bold mb-2">100+</p>
              <p className="text-gray-300">Local Farmers</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <p className="text-2xl font-bold mb-2">1,000+</p>
              <p className="text-gray-300">Happy Customers</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <p className="text-2xl font-bold mb-2">10,000+</p>
              <p className="text-gray-300">Orders Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
