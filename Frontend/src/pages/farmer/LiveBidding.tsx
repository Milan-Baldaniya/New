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
import { Clock, Gavel, Users, UserCheck, ArrowRight, AlertCircle, Bell, DollarSign, TrendingUp } from "lucide-react";
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
      socket.emit("joinAuction", { auctionId: auction.id });

      // Initialize live data for this auction
      setLiveData(prev => ({
        ...prev,
        [auction.id]: {
          participants: Math.floor(Math.random() * 8) + 2, // Mock data
          recentBids: []
        }
      }));
    });

    // Clean up socket connections when component unmounts
    return () => {
      active.forEach(auction => {
        socket.emit("leaveAuction", { auctionId: auction.id });
      });
    };
  }, [products]);

  // Enhanced socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    
    socket.on("auction:bid", (data) => {
      const { auctionId, amount, bidder, timestamp } = data;
      
      // Update live data for the auction
      setLiveData(prev => {
        const auctionData = prev[auctionId] || { participants: 0, recentBids: [] };
        return {
          ...prev,
          [auctionId]: {
            ...auctionData,
            recentBids: [
              { amount, bidder, timestamp: new Date(timestamp) },
              ...auctionData.recentBids
            ].slice(0, 5) // Keep only the 5 most recent bids
          }
        };
      });
      
      // Find product name for the notification
      const product = products.find(p => p.id === auctionId);
      if (product) {
        const bidderName = typeof bidder === 'object' ? bidder.name : bidder;
        
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
    });

    socket.on("auction:update", (data) => {
      const { auctionId, participantCount } = data;
      
      setLiveData(prev => ({
        ...prev,
        [auctionId]: {
          ...prev[auctionId],
          participants: participantCount
        }
      }));
    });

    return () => {
      socket.off("auction:bid");
      socket.off("auction:update");
    };
  }, [products, toast]);

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
    const timeLeft = calculateTimeLeft(product.endBidTime);
    const liveInfo = liveData[product.id] || { participants: 0, recentBids: [] };
    
    return (
      <Card key={product.id} className="mb-4 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3">
            <AspectRatio ratio={4/3} className="bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </AspectRatio>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              </div>
              <Badge 
                variant={timeLeft === "Ended" ? "outline" : "default"}
                className={timeLeft === "Ended" ? "bg-gray-200" : "bg-green-100 text-green-800"}
              >
                {timeLeft === "Ended" ? "Completed" : "Active"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(product.currentBid || product.startingBid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Left</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-orange-500" />
                  <p className="font-semibold">{timeLeft}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Starting Bid</p>
                <p>{formatCurrency(product.startingBid)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-blue-500" />
                  <p>{liveInfo.participants}</p>
                </div>
              </div>
            </div>
            
            {liveInfo.recentBids.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Recent Activity</p>
                <div className="bg-gray-50 p-2 rounded-md max-h-20 overflow-y-auto">
                  {liveInfo.recentBids.map((bid, idx) => (
                    <div key={idx} className="text-xs flex justify-between py-1">
                      <span>{bid.bidder}</span>
                      <span className="font-semibold">{formatCurrency(bid.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => viewAuctionDetails(product.id)}
              >
                View Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
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