import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Leaf, Calendar, Tag, Store, Info, Clock, Users, MinusCircle, PlusCircle } from "lucide-react";
import { Product } from "@/services/productService";
import { AnimatedButton } from "@/components/ui/animated-button";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { fetchProductById, addToCart, placeBid } = useMarketplace();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Store the product ID in a ref to prevent continuous re-renders
  const productIdRef = useRef<string | null>(null);
  if (product?.id) {
    productIdRef.current = product.id;
  }
  
  // Load product on initial render
  useEffect(() => {
    // Set mounted ref to true when component mounts
    isMounted.current = true;
    
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Loading product with ID: ${id}`);
        const productData = await fetchProductById(id);
        
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        if (!productData) {
          console.error("Product not found");
          setError("Product not found");
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
          navigate("/marketplace");
          return;
        }
        
        console.log('Product loaded successfully:', productData.id);
        
        // Set product first, then handle derived state
        setProduct(productData);
        
        // Set initial bid amount for auction products
        if (productData.bidding) {
          const minimumNextBid = (productData.currentBid || productData.startingBid || 0) + 0.5;
          setBidAmount(minimumNextBid);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        setError("Failed to load product details");
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
        navigate("/marketplace");
      } finally {
        // Only update state if component is still mounted
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadProduct();
    
    // Cleanup function
    return () => {
      console.log("ProductDetails component unmounting");
      // Set mounted ref to false when component unmounts
      isMounted.current = false;
    };
  }, [id]); // Only depend on ID to prevent unnecessary reruns
  
  // Update time left for auction
  useEffect(() => {
    // Skip this effect if no product or not a bidding product or no end time
    if (!product || !product.bidding || !product.endBidTime) return;
    
    // Check if component is still mounted
    if (!isMounted.current) return;
    
    // Store these values in local variables to prevent closure issues
    const endTimeStr = product.endBidTime;
    const productId = product.id;
    let timer: NodeJS.Timeout | null = null;
    
    console.log(`Setting up auction timer for product ${productId}`);
    
    const calculateTimeLeft = () => {
      // Don't update state if component unmounted
      if (!isMounted.current) return;
      
      try {
        const endTime = new Date(endTimeStr).getTime();
        const now = new Date().getTime();
        const difference = endTime - now;
        
        if (difference <= 0) {
          setTimeLeft("Auction ended");
          return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        let newTimeLeft = "";
        if (days > 0) {
          newTimeLeft = `${days} days, ${hours} hours left`;
        } else if (hours > 0) {
          newTimeLeft = `${hours} hours, ${minutes} minutes left`;
        } else {
          newTimeLeft = `${minutes} minutes left`;
        }
        
        setTimeLeft(newTimeLeft);
      } catch (error) {
        console.error("Error calculating time left:", error);
        setTimeLeft("Time calculation error");
      }
    };
    
    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 60000);
    
    return () => {
      console.log(`Cleaning up timer for product ${productId}`);
      if (timer) clearInterval(timer);
    };
  }, [productIdRef.current]); // Use the ref instead of product?.id
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  const handlePlaceBid = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    // Navigate to the live bidding page
    navigate(`/live-bidding/${product.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || "Product not found"}</p>
          <Button onClick={() => navigate("/marketplace")}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // Safe access to bidder information
  const getBidderName = () => {
    if (!product.bidder) return "Anonymous";
    
    if (typeof product.bidder === 'object' && product.bidder !== null) {
      return product.bidder.name || "Anonymous";
    }
    
    return typeof product.bidder === 'string' ? product.bidder : "Anonymous";
  };

  return (
    <div key={product?.id} className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-2">
              <AspectRatio ratio={4/3}>
                <img 
                  src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.jpg"} 
                  alt={product.name}
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
            </CardContent>
          </Card>
          
          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square">
                  <img 
                    src={img || "/placeholder.jpg"} 
                    alt={`${product.name} ${idx+1}`}
                    className="rounded-md object-cover w-full h-full cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.organic && (
                <Badge className="bg-farm-green-500">
                  <Leaf className="h-3 w-3 mr-1" /> Organic
                </Badge>
              )}
              <Badge variant="outline">
                <Tag className="h-3 w-3 mr-1" /> {product.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <div className="flex items-center mt-2 text-gray-600">
              <Store className="h-4 w-4 mr-1" />
              <span>{product.farmerName}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Price or Bid Section */}
          <div>
            {product.bidding ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Current Bid</p>
                    <p className="text-3xl font-bold">${(product.currentBid || product.startingBid || 0).toFixed(2)}</p>
                    {product.startingBid && (
                      <p className="text-sm text-gray-500">Starting bid: ${product.startingBid.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" /> {timeLeft}
                    </p>
                    {product.bidder && (
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" /> Current highest bidder: {getBidderName()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-grow">
                    <Input 
                      type="number" 
                      value={bidAmount?.toString() || ""}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                      min={(product.currentBid || product.startingBid || 0) + 0.01}
                      step="0.5"
                    />
                  </div>
                  <AnimatedButton 
                    onClick={handlePlaceBid}
                    disabled={!bidAmount || bidAmount <= (product.currentBid || product.startingBid || 0)}
                    className="bg-harvest-gold-600 hover:bg-harvest-gold-700"
                    variant="glowing"
                  >
                    Bid Now
                  </AnimatedButton>
                </div>
                
                <p className="text-sm text-gray-500">
                  Enter ${((product.currentBid || product.startingBid || 0) + 0.5).toFixed(2)} or more
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-3xl font-bold">${product.price.toFixed(2)} <span className="text-lg font-normal">/ {product.unit}</span></p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <p className="text-sm font-medium">Quantity:</p>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.quantity}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.quantity} {product.unit}s available
                  </p>
                </div>
                
                <Button 
                  onClick={handleAddToCart} 
                  className="w-full"
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Product Details Tabs */}
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2" /> Description
                </h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" /> Harvest Date
                  </h3>
                  <p className="text-gray-700">
                    {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : "Not specified"}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Certification</h3>
                  <p className="text-gray-700">
                    {product.organic ? "Certified Organic" : "Conventional"}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <p className="text-gray-700 mb-2">
                    Free local delivery for orders over $35.
                  </p>
                  <p className="text-gray-700">
                    Standard shipping: 2-4 business days.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Customer Reviews</h3>
                  <p className="text-gray-700">
                    No reviews yet for this product.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Write a Review
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
