import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AlertCircle, ArrowLeft, Clock, Gavel, Users, UserCheck, Award, RefreshCw, Lock, AlertTriangle } from "lucide-react";
import { Product } from "@/services/productService";
import { getSocket, getSocketUrl, createSocket, checkConnection } from "@/lib/socket";

const LiveBidding = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { fetchProductById, placeBid } = useMarketplace();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<Array<{
    amount: number;
    bidder: string;
    timestamp: Date;
  }>>([]);
  const [participants, setParticipants] = useState<number>(0);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
  
  // Use refs to prevent stale closures and track component mount state
  const isMounted = useRef(true);
  const productRef = useRef<Product | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoaded = useRef(false); // Track if we've already loaded the product
  
  // Debug socket connection on component mount
  useEffect(() => {
    console.log('LiveBidding: Component mounted');
    console.log('Socket URL:', getSocketUrl());
    
    // Get the socket instance or create one if it doesn't exist
    let socket = getSocket();
    if (!socket) {
      console.log('LiveBidding: Socket not found, creating a new one');
      createSocket();
      socket = getSocket();
    }
    
    console.log('Socket instance:', socket);
    console.log('Socket connected:', socket?.connected);
    console.log('Socket ID:', socket?.id);
    
    // Check socket connection
    const isConnected = checkConnection();
    setSocketConnected(isConnected);
    
    const handleConnect = () => {
      console.log('LiveBidding: Socket connected event fired');
      setSocketConnected(true);
      setSocketError(null);
      setReconnecting(false);
      
      // Join auction room again when reconnected
      if (id && productRef.current) {
        socket.emit("auction:join", id, (response) => {
          console.log("Rejoined auction room after reconnect:", response);
        });
      }
    };
    
    const handleDisconnect = (reason: string) => {
      console.log(`LiveBidding: Socket disconnected: ${reason}`);
      setSocketConnected(false);
      
      // Handle various disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect manually
        setSocketError('Server disconnected. Attempting to reconnect...');
        setReconnecting(true);
        socket.connect();
      } else if (reason === 'transport close') {
        setSocketError('Connection lost. Attempting to reconnect...');
        setReconnecting(true);
      } else {
        setSocketError(`Connection error: ${reason}`);
      }
    };
    
    const handleConnectionError = (error: Error) => {
      console.error('LiveBidding: Socket connection error:', error);
      setSocketConnected(false);
      setSocketError(`Connection error: ${error.message}`);
      setReconnecting(true);
      
      // Attempt to manually restore connection
      setTimeout(() => {
        if (isMounted.current) {
          console.log('LiveBidding: Manually attempting to restore connection');
          const connected = checkConnection();
          setSocketConnected(connected);
          if (connected) {
            setReconnecting(false);
            setSocketError(null);
          }
        }
      }, 3000);
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectionError);
    
    // Set up a periodic check for the socket connection
    const connectionCheckInterval = setInterval(() => {
      if (isMounted.current && !socketConnected) {
        console.log('LiveBidding: Checking socket connection...');
        const connected = checkConnection();
        setSocketConnected(connected);
        
        if (connected && socketError) {
          setSocketError(null);
          setReconnecting(false);
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectionError);
      clearInterval(connectionCheckInterval);
      
      // Leave the auction room when component unmounts
      if (socket.connected && id) {
        socket.emit("auction:leave", id);
      }
    };
  }, [id]);
  
  // Generate mock bid history (memoized to prevent re-creation)
  const generateMockBidHistory = useCallback((product: Product) => {
    if (!product.currentBid || !product.startingBid) return [];
    
    const mockHistory = [];
    let currentAmount = product.startingBid;
    
    // Generate random mock bids from starting bid to current bid
    while (currentAmount < (product.currentBid || 0)) {
      const bidIncrement = Math.random() * 2 + 0.5; // Random increment between 0.5 and 2.5
      currentAmount += bidIncrement;
      
      if (currentAmount > (product.currentBid || 0)) {
        currentAmount = product.currentBid || 0;
      }
      
      // Create mock bid with random user and time
      mockHistory.unshift({
        amount: currentAmount,
        bidder: getRandomBidderName(),
        timestamp: new Date(Date.now() - Math.random() * 1000000) // Random time in the past
      });
    }
    
    return mockHistory;
  }, []);
  
  // Get random bidder name for mock data
  const getRandomBidderName = useCallback(() => {
    const names = ["John D.", "Emma S.", "Michael T.", "Sarah P.", "Robert K.", "Lisa M."];
    return names[Math.floor(Math.random() * names.length)];
  }, []);
  
  // Load product on initial render - ensure this works independently
  useEffect(() => {
    isMounted.current = true;
    
    const loadProduct = async () => {
      if (!id || hasLoaded.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('LiveBidding: Loading product with ID:', id);
        const productData = await fetchProductById(id);
        
        if (!isMounted.current) return;
        
        if (!productData) {
          setError("Product not found");
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
          navigate("/marketplace");
          return;
        }
        
        // Verify this is an auction product
        if (!productData.bidding) {
          // If not an auction product, redirect to product page instead
          toast({
            title: "Not an auction",
            description: "This product is not available for bidding",
            variant: "destructive",
          });
          navigate(`/product/${id}`);
          return;
        }
        
        hasLoaded.current = true;
        setProduct(productData);
        productRef.current = productData;
        
        // Set initial bid amount
        const minimumNextBid = (productData.currentBid || productData.startingBid || 0) + 0.5;
        setBidAmount(minimumNextBid);
        
        // Initialize bid history
        if (bidHistory.length === 0) {
          // Either fetch actual bid history or generate mock data
          const mockBidHistory = generateMockBidHistory(productData);
          setBidHistory(mockBidHistory);
          setParticipants(Math.floor(Math.random() * 10) + 3);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        
        if (isMounted.current) {
          setError("Failed to load product details");
          toast({
            title: "Error",
            description: "Failed to load product details",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadProduct();
    
    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, fetchProductById, navigate, toast]);
  
  // Set up socket connection for real-time updates
  useEffect(() => {
    if (!product) {
      console.log('LiveBidding: No product data, skipping socket setup');
      return;
    }
    
    console.log(`LiveBidding: Setting up socket connection for auction ${product.id}`);
    console.log('LiveBidding: Socket connected status:', getSocket().connected);
    console.log('LiveBidding: Socket ID:', getSocket().id);
    
    // Join the auction room
    getSocket().emit("auction:join", product.id, (response) => {
      console.log("Joined auction room:", response);
      // Update participant count on successful join
      if (response && response.success) {
        setParticipants(response.participantCount);
      }
    });
    
    // Confirm connection status
    console.log(`LiveBidding: Socket connected: ${getSocket().connected ? 'Yes' : 'No'}, ID: ${getSocket().id}`);
    
    // Listen for new bids
    const handleNewBid = (data: any) => {
      console.log(`LiveBidding: Received new bid:`, data);
      if (!isMounted.current) return;
      
      // Update product with new bid
      setProduct(prevProduct => {
        if (!prevProduct) return null;
        
        return {
          ...prevProduct,
          currentBid: data.amount,
          bidder: data.bidder
        };
      });
      
      // Update bid history
      setBidHistory(prev => [
        {
          amount: data.amount,
          bidder: typeof data.bidder === 'object' ? data.bidder.name : 'Anonymous',
          timestamp: new Date(data.timestamp)
        },
        ...prev
      ]);
      
      // Update minimum bid amount
      setBidAmount(data.amount + 0.5);
      
      // Show toast notification
      toast({
        title: "New Bid Placed!",
        description: `${typeof data.bidder === 'object' ? data.bidder.name : 'Anonymous'} bid $${data.amount.toFixed(2)}`,
      });
    };
    
    // Listen for participant count updates
    const handleParticipantUpdate = (data: any) => {
      console.log(`LiveBidding: Participant update:`, data);
      if (isMounted.current && data.auctionId === product.id) {
        setParticipants(data.participantCount);
      }
    };
    
    getSocket().on("auction:bid", handleNewBid);
    getSocket().on("auction:update", handleParticipantUpdate);
    
    return () => {
      console.log('LiveBidding: Cleaning up socket connections');
      // Leave the auction room
      getSocket().emit("auction:leave", product.id, (response) => {
        console.log("Left auction room:", response);
      });
      getSocket().off("auction:bid", handleNewBid);
      getSocket().off("auction:update", handleParticipantUpdate);
    };
  }, [product?.id]); // Only depend on product.id, not the entire product object
  
  // Update time left for auction - only set up once when product loads
  useEffect(() => {
    if (!product || !product.bidding || !product.endBidTime) {
      console.log('LiveBidding: Missing endBidTime, skipping timer setup');
      return;
    }
    
    console.log('LiveBidding: Setting up auction timer with end time:', product.endBidTime);
    
    const calculateTimeLeft = () => {
      if (!isMounted.current || !productRef.current?.endBidTime) return;
      
      try {
        const endTime = new Date(productRef.current.endBidTime).getTime();
        const now = new Date().getTime();
        const difference = endTime - now;
        
        if (difference <= 0) {
          setTimeLeft("Auction ended");
          setIsAuctionEnded(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        
        // If auction is running, make sure isAuctionEnded is false
        setIsAuctionEnded(false);
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        let newTimeLeft = "";
        if (days > 0) {
          newTimeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (hours > 0) {
          newTimeLeft = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
          newTimeLeft = `${minutes}m ${seconds}s`;
        } else {
          newTimeLeft = `${seconds}s`;
        }
        
        setTimeLeft(newTimeLeft);
      } catch (error) {
        console.error("Error calculating time left:", error);
      }
    };
    
    calculateTimeLeft(); // Calculate immediately
    
    // Only set up timer if it doesn't exist yet
    if (!timerRef.current) {
      timerRef.current = setInterval(calculateTimeLeft, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [product?.id]); // Only depend on product.id
  
  // Check if auction has ended on component mount
  useEffect(() => {
    if (product?.endBidTime) {
      const endTime = new Date(product.endBidTime).getTime();
      const now = new Date().getTime();
      if (now >= endTime) {
        setIsAuctionEnded(true);
      }
    }
  }, [product?.endBidTime]);
  
  const handlePlaceBid = async () => {
    if (!product || !bidAmount || !isAuthenticated || !user) return;
    
    // Check if bid is high enough
    if (bidAmount <= (product.currentBid || product.startingBid || 0)) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than $${(product.currentBid || product.startingBid || 0).toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    setIsPlacingBid(true);
    
    try {
      console.log('LiveBidding: Placing bid:', {
        auctionId: product.id,
        amount: bidAmount,
        userId: user.id || user._id
      });
      
      // Use socket for real-time bidding
      getSocket().emit("auction:bid", {
        auctionId: product.id,
        amount: bidAmount,
        userId: user.id || user._id
      }, (response) => {
        console.log("Bid response:", response);
        
        // Handle bid response
        if (response && response.success) {
          // Bid will be reflected via socket event
          toast({
            title: "Bid Placed!",
            description: `You successfully bid $${bidAmount.toFixed(2)}`,
          });
        } else {
          toast({
            title: "Bid Failed",
            description: response?.error || "Failed to place your bid. Please try again.",
            variant: "destructive",
          });
        }
        
        setIsPlacingBid(false);
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      
      if (isMounted.current) {
        toast({
          title: "Bid Failed",
          description: "Failed to place your bid. Please try again.",
          variant: "destructive",
        });
        setIsPlacingBid(false);
      }
    }
  };
  
  // Add a manual reconnect function
  const reconnectSocket = useCallback(() => {
    setReconnecting(true);
    setSocketError('Attempting to reconnect...');
    
    // Close and recreate socket
    const socket = getSocket();
    if (socket) {
      socket.close();
    }
    
    createSocket();
    const newSocket = getSocket();
    
    // Check if reconnection was successful
    if (newSocket && newSocket.connected) {
      setSocketConnected(true);
      setSocketError(null);
      setReconnecting(false);
      
      // Rejoin auction room
      if (id) {
        newSocket.emit("auction:join", id);
      }
    } else {
      // Schedule another check
      setTimeout(() => {
        if (isMounted.current) {
          const connected = checkConnection();
          setSocketConnected(connected);
          setReconnecting(false);
          if (connected) {
            setSocketError(null);
          } else {
            setSocketError('Failed to reconnect. Please try again.');
          }
        }
      }, 2000);
    }
  }, [id]);
  
  // Return loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
        </div>
      </div>
    );
  }
  
  // Return error state
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
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate("/marketplace")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>
      
      {/* Auction ended notice */}
      {isAuctionEnded && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
            <div>
              <h3 className="font-semibold text-amber-800 text-lg">Auction has ended</h3>
              <p className="text-amber-700">
                This auction has closed and no more bids can be placed.
                {product.bidder && (
                  <span> The winning bid was ${(product.currentBid || 0).toFixed(2)} by {
                    typeof product.bidder === 'object' && product.bidder !== null 
                      ? (product.bidder.name || "Anonymous") 
                      : (typeof product.bidder === 'string' ? product.bidder : "Anonymous")
                  }.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Socket connection status */}
      {socketError && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-700 mr-2" />
            <span className="text-yellow-700">{socketError}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reconnectSocket}
            disabled={reconnecting}
          >
            {reconnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {reconnecting ? 'Reconnecting...' : 'Reconnect'}
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>
                by {product.farmerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AspectRatio ratio={1}>
                <img 
                  src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.jpg"} 
                  alt={product.name}
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Starting Bid:</span>
                  <span className="font-semibold">${product.startingBid?.toFixed(2) || "0.00"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Bid:</span>
                  <span className="font-bold text-lg text-farm-green-600">
                    ${(product.currentBid || product.startingBid || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Highest Bidder:</span>
                  <Badge variant="outline" className="flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {product.bidder 
                      ? (typeof product.bidder === 'object' && product.bidder !== null 
                          ? (product.bidder.name || "Anonymous") 
                          : (typeof product.bidder === 'string' ? product.bidder : "Anonymous"))
                      : "No bids yet"}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-bold">{timeLeft}</span>
                </div>
                
                <Badge>
                  <Users className="h-3 w-3 mr-1" />
                  {participants} bidders
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Live Bidding Column */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Place Your Bid
              </CardTitle>
              <CardDescription>
                Enter your bid amount below. Minimum bid increment is $0.50.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <Input 
                    type="number" 
                    value={bidAmount?.toString() || ""}
                    onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                    min={(product.currentBid || product.startingBid || 0) + 0.01}
                    step="0.5"
                    placeholder="Enter bid amount"
                    className="text-lg"
                    disabled={isAuctionEnded}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Minimum bid: ${((product.currentBid || product.startingBid || 0) + 0.5).toFixed(2)}
                  </p>
                </div>
                <Button 
                  onClick={handlePlaceBid}
                  disabled={
                    !isAuthenticated || 
                    !bidAmount || 
                    bidAmount <= (product.currentBid || product.startingBid || 0) ||
                    isPlacingBid ||
                    isAuctionEnded
                  }
                  className="bg-harvest-gold-600 hover:bg-harvest-gold-700 h-12 md:w-1/3"
                >
                  {isPlacingBid ? (
                    <div className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                      Bidding...
                    </div>
                  ) : isAuctionEnded ? (
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Auction Ended
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Gavel className="h-4 w-4 mr-2" />
                      Place Bid
                    </div>
                  )}
                </Button>
              </div>
              
              {isAuctionEnded && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-amber-800">
                      This auction has ended and no more bids can be placed.
                    </p>
                  </div>
                </div>
              )}
              
              {!isAuthenticated && !isAuctionEnded && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-amber-800">
                      You need to be logged in to place a bid.
                    </p>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-amber-600"
                      onClick={() => navigate("/login")}
                    >
                      Log in now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Bid History
              </CardTitle>
              <CardDescription>
                Recent bids on this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {bidHistory.length > 0 ? (
                  bidHistory.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-md bg-gray-50">
                      <div>
                        <p className="font-medium">{bid.bidder}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={index === 0 ? "bg-farm-green-600" : "bg-gray-600"}>
                        ${bid.amount.toFixed(2)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No bids placed yet. Be the first to bid!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveBidding; 