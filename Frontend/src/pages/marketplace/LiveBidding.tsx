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
import { getSocket, getSocketUrl, createSocket, checkConnection, closeSocket, broadcastBid } from "@/lib/socket";
import { formatCurrency } from "@/lib/utils";

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
  const hasLoaded = useRef(false);
  
  // Save bid history to localStorage whenever it changes
  useEffect(() => {
    if (id && bidHistory.length > 0) {
      localStorage.setItem(`bidHistory-${id}`, JSON.stringify(bidHistory));
    }
  }, [bidHistory, id]);
  
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
    
    // Create a new socket instance if existing one fails to connect
    if (!socket.connected && !socket.connecting) {
      console.log('LiveBidding: Socket not connected or connecting, creating a fresh instance');
      // Force close existing socket if any
      socket.close();
      socket = createSocket();
    }
    
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
    
    // Set up a periodic check for the socket connection - but less frequently
    // to reduce console noise and prevent continuous reconnection attempts
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
    }, 15000); // Check every 15 seconds instead of 5 seconds
    
    return () => {
      isMounted.current = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectionError);
      clearInterval(connectionCheckInterval);
      
      // Leave the auction room when component unmounts
      if (socket.connected && id) {
        socket.emit("auction:leave", id);
      }
      
      // Clean up old bid history items from localStorage (older than 7 days)
      const cleanupLocalStorage = () => {
        try {
          // Get all keys in localStorage
          const localStorageKeys = Object.keys(localStorage);
          
          // Filter keys that start with "bidHistory-"
          const bidHistoryKeys = localStorageKeys.filter(key => key.startsWith('bidHistory-'));
          
          // Set cutoff date to 7 days ago
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          
          // Go through each bidHistory item
          bidHistoryKeys.forEach(key => {
            try {
              // Skip the current auction's history
              if (id && key === `bidHistory-${id}`) return;
              
              const historyData = localStorage.getItem(key);
              if (!historyData) return;
              
              const parsedHistory = JSON.parse(historyData);
              
              // Check if this history is older than the cutoff date
              // Look at the most recent bid (the first one) timestamp
              if (parsedHistory.length > 0) {
                const latestBidTime = new Date(parsedHistory[0].timestamp);
                if (latestBidTime < cutoffDate) {
                  console.log(`LiveBidding: Removing old bid history for ${key}`);
                  localStorage.removeItem(key);
                }
              }
            } catch (e) {
              console.error(`LiveBidding: Error cleaning up localStorage key ${key}:`, e);
            }
          });
        } catch (e) {
          console.error('LiveBidding: Error during localStorage cleanup:', e);
        }
      };
      
      cleanupLocalStorage();
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
        
        // Try to load bid history from localStorage first
        const savedBidHistory = localStorage.getItem(`bidHistory-${id}`);
        if (savedBidHistory) {
          try {
            // Parse stored history and convert string timestamps back to Date objects
            const parsedHistory = JSON.parse(savedBidHistory);
            const historyWithDateObjects = parsedHistory.map((bid: any) => ({
              ...bid,
              timestamp: new Date(bid.timestamp)
            }));
            setBidHistory(historyWithDateObjects);
            console.log('LiveBidding: Loaded bid history from localStorage:', historyWithDateObjects);
          } catch (e) {
            console.error('LiveBidding: Error parsing bid history from localStorage:', e);
            // If there's an error loading from localStorage, generate mock data
            const mockBidHistory = generateMockBidHistory(productData);
            setBidHistory(mockBidHistory);
          }
        } else if (bidHistory.length === 0) {
          // If no saved history exists, generate mock data
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
  
  // Store auction ID in localStorage for reference by farmer dashboard
  useEffect(() => {
    if (id) {
      // Store this auction ID in localStorage for cross-reference with farmer dashboard
      try {
        // Get existing recently viewed auctions
        const recentAuctions = localStorage.getItem('recentlyViewedAuctions') || '[]';
        const auctionIds = JSON.parse(recentAuctions);
        
        // Add current auction to the start of the list if not already there
        if (!auctionIds.includes(id)) {
          auctionIds.unshift(id);
          
          // Keep only the 5 most recent auctions
          const updatedAuctions = auctionIds.slice(0, 5);
          
          // Save back to localStorage
          localStorage.setItem('recentlyViewedAuctions', JSON.stringify(updatedAuctions));
          console.log('LiveBidding: Stored auction ID in localStorage for farmer reference:', id);
        }
      } catch (e) {
        console.error('LiveBidding: Error updating recently viewed auctions:', e);
        // If error, just try to save this auction ID directly
        localStorage.setItem('recentlyViewedAuctions', JSON.stringify([id]));
      }

      // Also explicitly store the current auction ID for easy access
      localStorage.setItem('currentViewingAuctionId', id);
    }
  }, [id]);
  
  // Join auction room and set up listeners
  useEffect(() => {
    if (!id) return;
    
    console.log(`Joining auction room for ${id}`);
    const socket = getSocket();
    
    // Ensure socket is connected
    if (!socket.connected) {
      console.log('Socket not connected, connecting...');
      socket.connect();
    }
    
    // Join auction room - try both formats for compatibility
    socket.emit('auction:join', { auctionId: id }, (response) => {
      if (response && response.success) {
        console.log('Successfully joined auction room with object format');
        setParticipants(response.participantCount || 1);
      } else {
        // Try direct ID format
        socket.emit('auction:join', id, (directResponse) => {
          if (directResponse && directResponse.success) {
            console.log('Successfully joined auction room with direct ID');
            setParticipants(directResponse.participantCount || 1);
          } else {
            console.error('Failed to join auction room in both formats');
          }
        });
      }
    });
    
    // Listener for new bids
    const handleBid = (data) => {
      console.log('Received bid event:', data);
      const { auctionId, amount, bidder, timestamp } = data;
      
      // Only process if this is for our auction
      if (auctionId !== id) return;
      
      // Get bidder name
      const bidderName = typeof bidder === 'object' ? bidder.name : 
                        bidder?.name ? bidder.name : 
                        typeof bidder === 'string' ? bidder : 'Anonymous';
      
      // Add to bid history
      setBidHistory(prev => [
        {
          amount,
          bidder: bidderName,
          timestamp: new Date(timestamp || new Date())
        },
        ...prev
      ]);
      
      // Update product data
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: amount,
          bidder: bidder
        };
      });
      
      // Update product ref for other effects
      if (productRef.current) {
        productRef.current = {
          ...productRef.current,
          currentBid: amount,
          bidder: bidder
        };
      }
    };
    
    // Listener for participant updates
    const handleParticipantUpdate = (data) => {
      console.log('Received participant update:', data);
      if (data.auctionId === id) {
        setParticipants(data.participantCount || participants);
      }
    };
    
    // Register listeners
    socket.on('auction:bid', handleBid);
    socket.on('auction:update', handleParticipantUpdate);
    
    // Clean up on unmount
    return () => {
      console.log(`Leaving auction room for ${id}`);
      socket.emit('auction:leave', { auctionId: id });
      socket.emit('auction:leave', id);
      socket.off('auction:bid', handleBid);
      socket.off('auction:update', handleParticipantUpdate);
    };
  }, [id, participants]);
  
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
    if (!product || !id || !bidAmount) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to place bids",
        variant: "destructive",
      });
      return;
    }
    
    if (isAuctionEnded) {
      toast({
        title: "Auction Ended",
        description: "This auction has already ended",
        variant: "destructive",
      });
      return;
    }
    
    // Validate bid amount
    const minBid = (product.currentBid || product.startingBid || 0) + 0.5;
    if (bidAmount < minBid) {
      toast({
        title: "Invalid Bid",
        description: `Your bid must be at least ${formatCurrency(minBid)}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsPlacingBid(true);
      
      // Add the bid to history immediately so UI feels responsive
      const newBid = {
        amount: bidAmount,
        bidder: user?.name || 'You',
        timestamp: new Date()
      };
      
      // Update the UI optimistically
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: bidAmount,
          bidder: user
        };
      });
      
      setBidHistory(prev => [newBid, ...prev]);
      
      // Attempt the bid through MarketplaceContext
      const result = await placeBid(id, bidAmount);
      
      if (result) {
        console.log('LiveBidding: Bid placed successfully:', result);
        
        // Ensure the bid is broadcast to all clients
        try {
          const bidderInfo = {
            id: user?.id,
            name: user?.name || "Anonymous"
          };
          
          // Use the utility function to broadcast the bid
          const broadcastSuccess = await broadcastBid(id, bidAmount, bidderInfo);
          console.log(`Bid broadcast ${broadcastSuccess ? 'succeeded' : 'may have failed'}`);
        } catch (broadcastError) {
          console.error("Error broadcasting bid:", broadcastError);
          // Continue anyway since API bid was successful
        }
        
        // Show success toast
        toast({
          title: "Bid Placed!",
          description: `Your bid of ${formatCurrency(bidAmount)} was placed successfully`,
        });
        
        // Update product data from result
        setProduct(result);
        productRef.current = result;
        
        // Set next minimum bid
        setBidAmount(bidAmount + 0.5);
      } else {
        console.error('LiveBidding: Bid placement failed with no result');
        
        // If the bid failed through the API, roll back our optimistic UI updates
        if (product) {
          setProduct(product);
          
          // Remove the optimistically added bid from history
          setBidHistory(prev => prev.filter((bid, index) => index > 0));
        }
        
        toast({
          title: "Bid Failed",
          description: "There was an error placing your bid. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('LiveBidding: Error placing bid:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Bid error details:', error.message, error.stack);
      }
      
      // Roll back optimistic UI updates on error
      if (product) {
        setProduct(product);
        setBidHistory(prev => prev.filter((bid, index) => index > 0));
      }
      
      toast({
        title: "Bid Failed",
        description: error instanceof Error ? error.message : "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBid(false);
    }
  };
  
  // Add a modified reconnect function
  const reconnectSocket = useCallback(() => {
    if (reconnecting) return; // Don't attempt multiple reconnections at once
    
    setReconnecting(true);
    setSocketError('Attempting to reconnect...');
    
    // Close existing socket completely
    closeSocket();
    
    // Create a new socket with modified settings for more reliable connection
    const newSocket = createSocket();
    
    // Give time for the socket to connect
    setTimeout(() => {
      if (!isMounted.current) return;
      
      if (newSocket.connected) {
        console.log('LiveBidding: Socket reconnected successfully');
        setSocketConnected(true);
        setSocketError(null);
        setReconnecting(false);
        
        // Rejoin auction room
        if (id) {
          newSocket.emit("auction:join", id, (response) => {
            console.log("Rejoined auction room after manual reconnect:", response);
          });
        }
      } else {
        console.log('LiveBidding: Socket still not connected after reconnect attempt');
        setSocketError('Failed to reconnect. Please refresh the page.');
        setReconnecting(false);
      }
    }, 3000);
  }, [id, reconnecting]);
  
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
                  <span> The winning bid was ${formatCurrency(product.currentBid || 0)} by {
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
                  <span className="font-semibold">{formatCurrency(product.startingBid)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Bid:</span>
                  <span className="font-bold text-lg text-farm-green-600">
                    {formatCurrency(product.currentBid || product.startingBid || 0)}
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
                    Minimum bid: {formatCurrency((product.currentBid || product.startingBid || 0) + 0.5)}
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
                        {formatCurrency(bid.amount)}
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