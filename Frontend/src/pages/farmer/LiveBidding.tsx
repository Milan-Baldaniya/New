import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, Gavel, Users, UserCheck, ArrowRight, AlertCircle, Bell, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { Product } from "@/services/productService";
import { getSocket } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";

const LiveBidding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { products, loading, error: fetchError, fetchProducts } = useMarketplace();
  const { toast } = useToast();

  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<Product[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<Product[]>([]);
  const [completedAuctions, setCompletedAuctions] = useState<Product[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const [liveData, setLiveData] = useState<Record<string, {
    participants: number;
    recentBids: Array<{amount: number, bidder: string, timestamp: Date}>;
  }>>({});
  const [bidNotifications, setBidNotifications] = useState<Array<{
    productId: string;
    productName: string;
    bidder: string;
    amount: number;
    timestamp: Date;
    seen: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{
    productId: string;
    productName: string;
    bidder: string;
    amount: number;
    timestamp: Date;
    productImage?: string;
  } | null>(null);

  // Handle manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Refetch products from API
      await fetchProducts({ farmer: user?.id, isAuction: true });
      
      // Also reconnect to socket rooms
      const socket = getSocket();
      
      if (!socket.connected) {
        socket.connect();
      }
      
      // Rejoin auction rooms
      activeAuctions.forEach(auction => {
        socket.emit("auction:join", { auctionId: auction.id });
      });
      
      toast({
        title: "Refreshed",
        description: "Auction data has been refreshed",
      });
    } catch (error) {
      console.error("Failed to refresh auction data:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh auction data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch farmer's auction products
  useEffect(() => {
    const loadProducts = async () => {
      if (!isAuthenticated || !user) {
        toast({
          title: "Authentication required",
          description: "Please login to access your auctions",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        // Only fetch products created by this farmer that are auctions
        await fetchProducts({ farmer: user.id, isAuction: true });
      } catch (error) {
        console.error("Failed to fetch auction products:", error);
        toast({
          title: "Error",
          description: "Failed to load your auction products",
          variant: "destructive",
        });
      }
    };

    loadProducts();
  }, [isAuthenticated, user, fetchProducts, navigate, toast]);

  // Process products into auction categories
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const socket = getSocket();
    
    // Ensure socket is connected
    if (!socket.connected) {
      console.log('LiveBidding: Socket not connected, attempting to connect...');
      socket.connect();
    }

    const auctionItems = products.filter(product => product.bidding);
    setAuctionProducts(auctionItems);

    const now = new Date();
    
    // Sort auction products into categories
    const active = auctionItems.filter(product => {
      const endDate = new Date(product.endBidTime || '');
      const startDate = new Date(product.startBidTime || '');
      return startDate <= now && endDate > now;
    });
    
    const upcoming = auctionItems.filter(product => {
      const startDate = new Date(product.startBidTime || '');
      return startDate > now;
    });
    
    const completed = auctionItems.filter(product => {
      const endDate = new Date(product.endBidTime || '');
      return endDate <= now;
    });

    setActiveAuctions(active);
    setUpcomingAuctions(upcoming);
    setCompletedAuctions(completed);

    // Connect to socket for each active auction
    active.forEach(auction => {
      console.log(`Joining auction room for ${auction.id}`);
      
      // First try the object format
      socket.emit("auction:join", { auctionId: auction.id }, (response) => {
        if (response && response.success) {
          console.log(`Successfully joined auction room: ${auction.id}`);
        } else {
          // If object format fails, try direct ID format
          console.log(`Trying direct ID join for auction: ${auction.id}`);
          socket.emit("auction:join", auction.id, (directResponse) => {
            if (directResponse && directResponse.success) {
              console.log(`Successfully joined auction room with direct ID: ${auction.id}`);
            } else {
              console.error(`Failed to join auction room: ${auction.id}`);
            }
          });
        }
      });

      // Initialize live data for this auction
      setLiveData(prev => ({
        ...prev,
        [auction.id]: {
          participants: 0, // Will be updated by socket events
          recentBids: []
        }
      }));
    });

    // Debug socket status
    const debugInterval = setInterval(() => {
      const isConnected = socket.connected;
      console.log(`LiveBidding: Socket connected: ${isConnected ? 'Yes' : 'No'}`);
      
      if (!isConnected) {
        console.log('LiveBidding: Socket disconnected, attempting to reconnect...');
        socket.connect();
      }
    }, 10000);

    // Clean up socket connections when component unmounts
    return () => {
      active.forEach(auction => {
        console.log(`Leaving auction room: ${auction.id}`);
        socket.emit("auction:leave", { auctionId: auction.id });
        socket.emit("auction:leave", auction.id);
      });
      
      clearInterval(debugInterval);
    };
  }, [products]);

  // Periodic auction status check to update categories
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const checkAuctionStatus = () => {
      console.log('Checking auction statuses...');
      const now = new Date();
      
      // Re-categorize auctions
      const auctionItems = products.filter(product => product.bidding);
      
      const active = auctionItems.filter(product => {
        const endDate = new Date(product.endBidTime || '');
        const startDate = new Date(product.startBidTime || '');
        return startDate <= now && endDate > now;
      });
      
      const upcoming = auctionItems.filter(product => {
        const startDate = new Date(product.startBidTime || '');
        return startDate > now;
      });
      
      const completed = auctionItems.filter(product => {
        const endDate = new Date(product.endBidTime || '');
        return endDate <= now;
      });
      
      // Update state if categories have changed
      if (JSON.stringify(active.map(p => p.id)) !== JSON.stringify(activeAuctions.map(p => p.id))) {
        console.log('Active auctions changed, updating...');
        setActiveAuctions(active);
      }
      
      if (JSON.stringify(upcoming.map(p => p.id)) !== JSON.stringify(upcomingAuctions.map(p => p.id))) {
        console.log('Upcoming auctions changed, updating...');
        setUpcomingAuctions(upcoming);
      }
      
      if (JSON.stringify(completed.map(p => p.id)) !== JSON.stringify(completedAuctions.map(p => p.id))) {
        console.log('Completed auctions changed, updating...');
        setCompletedAuctions(completed);
      }
    };
    
    // Check initially
    checkAuctionStatus();
    
    // Set up interval to check auction status every minute
    const statusInterval = setInterval(checkAuctionStatus, 60000);
    
    return () => clearInterval(statusInterval);
  }, [products, activeAuctions, upcomingAuctions, completedAuctions]);

  // Enhanced socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    
    // Debug: Log the current socket connection status
    console.log(`Socket connection status: ${socket.connected ? 'Connected' : 'Disconnected'}`);
    
    // Handler for the auction:bid event
    const handleBid = (data) => {
      console.log('Received bid event:', data);
      const { auctionId, amount, bidder, timestamp } = data;
      
      // Update live data for the auction
      setLiveData(prev => {
        const auctionData = prev[auctionId] || { participants: 0, recentBids: [] };
        
        const bidderName = typeof bidder === 'object' ? bidder.name : 
                          bidder?.name ? bidder.name : 
                          typeof bidder === 'string' ? bidder : 'Anonymous';
        
        return {
          ...prev,
          [auctionId]: {
            ...auctionData,
            recentBids: [
              { amount, bidder: bidderName, timestamp: new Date(timestamp) },
              ...auctionData.recentBids
            ].slice(0, 5) // Keep only the 5 most recent bids
          }
        };
      });
      
      // Also update the product's current bid in state
      setAuctionProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === auctionId
            ? {
                ...product,
                currentBid: amount,
                bidder: bidder
              }
            : product
        )
      );
      
      // Update active and other auction categories
      const now = new Date();
      
      setActiveAuctions(prev => 
        prev.map(product => 
          product.id === auctionId
            ? {
                ...product,
                currentBid: amount,
                bidder: bidder
              }
            : product
        )
      );
      
      setUpcomingAuctions(prev => 
        prev.map(product => 
          product.id === auctionId
            ? {
                ...product,
                currentBid: amount,
                bidder: bidder
              }
            : product
        )
      );
      
      setCompletedAuctions(prev => 
        prev.map(product => 
          product.id === auctionId
            ? {
                ...product,
                currentBid: amount,
                bidder: bidder
              }
            : product
        )
      );
      
      // Find product name for the notification
      const product = products.find(p => p.id === auctionId);
      if (product) {
        const bidderName = typeof bidder === 'object' ? bidder.name : 
                          bidder?.name ? bidder.name : 
                          typeof bidder === 'string' ? bidder : 'Anonymous';
        
        // Set active notification for animation
        setActiveNotification({
          productId: auctionId,
          productName: product.name,
          bidder: bidderName,
          amount: amount,
          timestamp: new Date(timestamp),
          productImage: product.images && product.images.length > 0 ? product.images[0] : undefined
        });

        // Add to notifications list
        setBidNotifications(prev => [
          {
            productId: auctionId,
            productName: product.name,
            bidder: bidderName,
            amount: amount,
            timestamp: new Date(timestamp),
            seen: false
          },
          ...prev
        ].slice(0, 10)); // Keep only the 10 most recent notifications
        
        // Display toast notification
        toast({
          title: "New Bid Received!",
          description: `${bidderName} placed a bid of ${formatCurrency(amount)} on ${product.name}`,
          variant: "default",
        });
        
        // Clear active notification after 5 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
      }
    };

    socket.on("auction:bid", handleBid);

    const handleParticipantUpdate = (data) => {
      console.log('Received participant update:', data);
      const { auctionId, participantCount } = data;
      
      setLiveData(prev => {
        const auctionData = prev[auctionId] || { participants: 0, recentBids: [] };
        return {
          ...prev,
          [auctionId]: {
            ...auctionData,
            participants: participantCount || auctionData.participants
          }
        };
      });
    };

    socket.on("auction:update", handleParticipantUpdate);

    // Setup connection status handler
    const handleConnect = () => {
      console.log('Socket connected event fired');
      
      // Rejoin auction rooms for active auctions
      activeAuctions.forEach(auction => {
        console.log(`Rejoining auction room after reconnect: ${auction.id}`);
        socket.emit("auction:join", { auctionId: auction.id });
        socket.emit("auction:join", auction.id);
      });
    };

    socket.on('connect', handleConnect);

    // Check connection status periodically
    const connectionInterval = setInterval(() => {
      if (!socket.connected) {
        console.log('Socket disconnected, attempting to reconnect...');
        socket.connect();
      }
    }, 15000);

    return () => {
      socket.off("auction:bid", handleBid);
      socket.off("auction:update", handleParticipantUpdate);
      socket.off('connect', handleConnect);
      clearInterval(connectionInterval);
    };
  }, [products, activeAuctions, toast]);

  // Calculate time left for an auction
  const calculateTimeLeft = (endTime: string | undefined) => {
    if (!endTime) return "N/A";
    
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Navigate to detailed auction view
  const viewAuctionDetails = (productId: string) => {
    navigate(`/marketplace/live-bidding/${productId}`);
  };

  // Render auction card
  const renderAuctionCard = (product: Product) => {
    const auctionData = liveData[product.id] || { participants: 0, recentBids: [] };
    const timeLeft = calculateTimeLeft(product.endBidTime);
    const currentBid = product.currentBid || product.startingBid || 0;
    
    // Check if in development mode
    const isDevelopment = import.meta.env.DEV;
    
    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex flex-wrap gap-3 mb-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={timeLeft === "Ended" ? "text-red-500" : ""}>{timeLeft}</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{auctionData.participants} bidder{auctionData.participants !== 1 ? 's' : ''}</span>
            </Badge>
            
            {product.organic && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Organic
              </Badge>
            )}
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="mb-3">
              <AspectRatio ratio={16 / 9}>
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500">Starting Bid</p>
              <p className="font-medium">{formatCurrency(product.startingBid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Bid</p>
              <p className="font-bold text-green-600">{formatCurrency(currentBid)}</p>
            </div>
          </div>
          
          {auctionData.recentBids.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Recent Bidding Activity</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {auctionData.recentBids.slice(0, 3).map((bid, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="font-medium truncate">{bid.bidder}</span>
                    <span>{formatCurrency(bid.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => viewAuctionDetails(product.id)}
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            {isDevelopment && timeLeft !== "Ended" && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
                onClick={() => simulateTestBid(product.id)}
              >
                Test Bid
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render auction list based on selected tab
  const renderAuctionList = () => {
    let productsToShow: Product[] = [];
    let emptyMessage = "";
    
    switch (selectedTab) {
      case "active":
        productsToShow = activeAuctions;
        emptyMessage = "You have no active auctions.";
        break;
      case "upcoming":
        productsToShow = upcomingAuctions;
        emptyMessage = "You have no upcoming auctions.";
        break;
      case "completed":
        productsToShow = completedAuctions;
        emptyMessage = "You have no completed auctions.";
        break;
      default:
        productsToShow = auctionProducts;
        emptyMessage = "You have no auction products.";
    }
    
    if (productsToShow.length === 0) {
      return (
        <div className="py-8 text-center">
          <Gavel className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{emptyMessage}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating an auction product.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/farmer/dashboard/add-product")}>
              Create Auction Product
            </Button>
          </div>
        </div>
      );
    }
    
    return productsToShow.map(product => renderAuctionCard(product));
  };
  
  // Render statistics cards
  const renderStatistics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Active Auctions</h3>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Live
              </Badge>
            </div>
            <p className="text-3xl font-bold mt-2">{activeAuctions.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium">Upcoming Auctions</h3>
            <p className="text-3xl font-bold mt-2">{upcomingAuctions.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium">Completed Auctions</h3>
            <p className="text-3xl font-bold mt-2">{completedAuctions.length}</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Mark all notifications as seen
  const markAllNotificationsAsSeen = () => {
    setBidNotifications(prev => 
      prev.map(notification => ({ ...notification, seen: true }))
    );
  };

  // Render notifications panel
  const renderNotificationsPanel = () => {
    if (!showNotifications) return null;
    
    const unseenCount = bidNotifications.filter(n => !n.seen).length;
    
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Bid Notifications</h3>
          {unseenCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllNotificationsAsSeen}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {bidNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No recent bid notifications
          </div>
        ) : (
          <div>
            {bidNotifications.map((notification, idx) => (
              <div 
                key={idx} 
                className={`p-3 border-b hover:bg-gray-50 ${notification.seen ? '' : 'bg-blue-50'}`}
                onClick={() => navigate(`/marketplace/live-bidding/${notification.productId}`)}
              >
                <div className="flex justify-between">
                  <p className="font-medium">{notification.productName}</p>
                  <span className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-sm">
                  <span className="font-semibold">{notification.bidder}</span> placed a bid of{' '}
                  <span className="font-semibold">{formatCurrency(notification.amount)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render live bid notification overlay
  const renderLiveBidNotification = () => {
    if (!activeNotification) return null;
    
    return (
      <AnimatePresence>
        <motion.div 
          className="fixed bottom-6 right-6 z-50 max-w-md"
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300 
          }}
        >
          <Card className="overflow-hidden border-2 border-green-500 shadow-lg">
            <CardHeader className="py-2 px-4 bg-green-500 text-white flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">New Bid Received!</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:bg-green-600" 
                onClick={() => setActiveNotification(null)}
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-3">
                {activeNotification.productImage ? (
                  <div className="flex-shrink-0 h-16 w-16 rounded overflow-hidden">
                    <img 
                      src={activeNotification.productImage} 
                      alt={activeNotification.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 h-16 w-16 rounded bg-gray-100 flex items-center justify-center">
                    <Gavel className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{activeNotification.productName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{activeNotification.bidder}</span> just placed a bid!
                  </p>
                  <div className="mt-2 flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(activeNotification.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={() => {
                  navigate(`/marketplace/live-bidding/${activeNotification.productId}`);
                  setActiveNotification(null);
                }}
              >
                View Auction
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  };

  // For debugging - simulate a bid on a product
  const simulateTestBid = (productId: string) => {
    const socket = getSocket();
    
    if (!socket.connected) {
      toast({
        title: "Socket not connected",
        description: "Cannot simulate bid - socket is not connected",
        variant: "destructive"
      });
      socket.connect();
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast({
        title: "Product not found",
        description: "Cannot simulate bid on unknown product",
        variant: "destructive"
      });
      return;
    }
    
    // Create a test bid amount slightly higher than current
    const currentBid = product.currentBid || product.startingBid || 0;
    const bidAmount = currentBid + 0.5;
    
    // Create test bidder
    const testBidder = {
      id: "test-user-" + Math.floor(Math.random() * 1000),
      name: "Test Bidder " + Math.floor(Math.random() * 100)
    };
    
    // Create bid data
    const bidData = {
      auctionId: productId,
      amount: bidAmount,
      userId: testBidder.id,
      bidder: testBidder,
      timestamp: new Date().toISOString()
    };
    
    console.log(`LiveBidding: Simulating test bid:`, bidData);
    
    // Emit directly
    socket.emit('auction:bid', bidData, (response: any) => {
      console.log("Test bid response:", response);
      
      if (response && response.success) {
        toast({
          title: "Test bid sent",
          description: `Simulated bid of ${formatCurrency(bidAmount)} on ${product.name}`,
        });
      } else {
        toast({
          title: "Test bid failed",
          description: response?.error || "Unknown error",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Render the animated notification block */}
      {renderLiveBidNotification()}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Auction Management</h1>
          <p className="text-gray-600">Monitor and manage your auction products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showNotifications) {
                  markAllNotificationsAsSeen();
                }
              }}
            >
              <Bell className="h-5 w-5" />
              {bidNotifications.filter(n => !n.seen).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {bidNotifications.filter(n => !n.seen).length}
                </span>
              )}
            </Button>
            {renderNotificationsPanel()}
          </div>
          <Button onClick={() => navigate("/farmer/dashboard/add-product")}>
            Create New Auction
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {/* Live Bids Activity Feed */}
      {activeAuctions.length > 0 && bidNotifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Bid Activity</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {bidNotifications.slice(0, 5).map((notification, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{notification.productName}</p>
                      <p className="text-sm text-gray-600">
                        Bid by <span className="font-semibold">{notification.bidder}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(notification.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {notification.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {renderStatistics()}
      
      <Tabs 
        defaultValue="active" 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Auctions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Auctions</TabsTrigger>
          <TabsTrigger value="completed">Completed Auctions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading active auctions...</div>
          ) : (
            renderAuctionList()
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading upcoming auctions...</div>
          ) : (
            renderAuctionList()
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading completed auctions...</div>
          ) : (
            renderAuctionList()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveBidding; 