import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Clock, ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/context/MarketplaceContext";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import TiltCard from "@/components/ui/tilt-card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  farmerId: string;
  farmerName: string;
  category: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  organic: boolean;
  bidding: boolean;
  currentBid?: number;
  endBidTime?: string;
  startingBid?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useMarketplace();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Calculate staggered animation delay based on index
  const animationDelay = `${index * 0.1}s`;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    // Prevent default link behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks while processing
    if (isAddingToCart) return;
    
    // Set adding state
    setIsAddingToCart(true);
    
    // Add to cart
    addToCart(product, 1);
    
    // Reset state after delay
    const timer = setTimeout(() => {
      if (timer) {
        setIsAddingToCart(false);
        clearTimeout(timer);
      }
    }, 1000);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Format price or bid
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Calculate time left for bidding
  const getTimeLeft = () => {
    if (!product.endBidTime) return "";
    
    const endTime = new Date(product.endBidTime).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return "Auction ended";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hours left`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days left`;
    }
  };

  // Get product price or current bid
  const getPrice = () => {
    if (product.bidding) {
      return formatPrice(product.currentBid || product.startingBid || product.price);
    } else {
      return formatPrice(product.price);
    }
  };

  return (
    <TiltCard 
      className={cn(
        "relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col",
        "transition-all duration-300 animate-fade-in-up",
        isHovered ? "z-10 shadow-lg transform scale-[1.02]" : "z-0",
        "hover:border-farm-green-300"
      )}
      style={{ animationDelay }}
      tiltMaxAngle={3}
      glareMaxOpacity={0.1}
      perspective={1500}
      gyroscope={false}
    >
      <div
        className="flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="flex flex-col flex-grow">
          <div className="absolute top-2 right-2 z-20 flex space-x-2">
            <button 
              onClick={toggleFavorite}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all",
                "transform hover:scale-110 hover:shadow-md",
                isFavorite ? "text-red-500" : "text-gray-400"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn(
                "h-5 w-5 transition-all duration-300",
                isFavorite && "animate-heartbeat fill-current"
              )} />
            </button>
          </div>
          
          <div className="relative h-48 overflow-hidden group">
            <img 
              src={product.images[0] || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
            />
            
            {product.organic && (
              <Badge className="absolute top-2 left-2 bg-farm-green-500 z-10 animate-fade-in">
                <Leaf className="h-3 w-3 mr-1 animate-pulse-subtle" /> Organic
              </Badge>
            )}
            
            {product.bidding && (
              <Badge className="absolute bottom-2 left-2 bg-harvest-gold-500 z-10 animate-fade-in">
                <Clock className="h-3 w-3 mr-1 animate-pulse-subtle" /> {getTimeLeft()}
              </Badge>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start h-full">
              <div className="flex flex-col transition-transform duration-300 group-hover:translate-x-1">
                <h3 className="font-semibold text-lg group-hover:text-farm-green-700 transition-colors duration-300 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 truncate">{product.farmerName}</p>
                <div className="mt-2 transform transition-all duration-300 group-hover:scale-105 origin-left">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                {product.bidding ? (
                  <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    <p className="font-bold text-lg text-harvest-gold-500">{getPrice()}</p>
                  </div>
                ) : (
                  <p className="font-bold text-lg text-farm-green-600 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">{getPrice()}</p>
                )}
              </div>
            </div>
          </div>
        </Link>
        
        <div className="px-4 pb-4 mt-auto">
          {!product.bidding ? (
            <AnimatedButton 
              variant={isAddingToCart ? "glowing" : "default"}
              size="default"
              onClick={handleAddToCart}
              className={cn(
                "w-full text-sm transition-all duration-300 hover:shadow-md",
                isAddingToCart 
                  ? "bg-farm-green-600 text-white" 
                  : "bg-farm-green-500 hover:bg-farm-green-600 text-white hover:transform hover:-translate-y-1"
              )}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 animate-scale-in-center">✓</span> Added to Cart
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" /> 
                  Add to Cart
                </span>
              )}
            </AnimatedButton>
          ) : (
            <Link to={`/live-bidding/${product.id}`} className="block w-full">
              <AnimatedButton 
                variant="highlight"
                size="default"
                className="w-full text-sm group bg-harvest-gold-500 hover:bg-harvest-gold-600 text-white transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                }}
              >
                <span className="flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" /> 
                  Bid Now
                </span>
              </AnimatedButton>
            </Link>
          )}
        </div>
      </div>
    </TiltCard>
  );
};

export default ProductCard;
