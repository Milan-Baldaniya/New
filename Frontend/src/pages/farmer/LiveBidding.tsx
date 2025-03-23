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
import { Product, productService } from "@/services/productService";
import { getSocket, emitBid, syncAuctionState, broadcastBid } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

// Add TypeScript declarations
declare global {
  interface Window {
    logEvent?: (type: string, data: any) => void;
  }
}

// Debug logger for tracing events
const logEvent = (type, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] FARMER DASHBOARD EVENT - ${type}:`, data);
  
  // Also send to server logs for persistent debugging
  try {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('debug:log', {
        component: 'FarmerLiveBidding',
        timestamp,
        type,
        data
      });
    }
  } catch (e) {
    // Ignore errors in debug logging
  }
  
  // Use the window.logEvent if available (for debug panel)
  if (window.logEvent) {
    window.logEvent(type, data);
  }
};

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
    logEvent('refresh', 'Manual refresh started');
    setIsRefreshing(true);
    
    try {
      // Refetch products from API
      await fetchProducts({ farmer: user?.id, isAuction: true });
      
      // Also reconnect to socket rooms
      const socket = getSocket();
      
      if (!socket.connected) {
        socket.connect();
        
        // Wait for connection before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Sync each active auction
      const syncPromises = activeAuctions.map(async (auction) => {
        try {
          console.log(`Syncing auction ${auction.id}...`);
          const state = await syncAuctionState(auction.id);
          console.log(`Sync result for auction ${auction.id}:`, state);
          
          if (state && state.success) {
            // Update product in our lists if needed
            if (state.product) {
              setActiveAuctions(prev => 
                prev.map(p => p.id === auction.id 
                  ? { 
                      ...p, 
                      currentBid: state.product.currentBid, 
                      bidder: state.product.bidder 
                    }
                  : p
                )
              );
            }
            
            // Update bid history
            if (state.bidHistory && state.bidHistory.length > 0) {
              setLiveData(prev => {
                const auctionData = prev[auction.id] || { participants: 0, recentBids: [] };
                
                // Convert timestamps to Date objects
                const formattedHistory = state.bidHistory.map(bid => ({
                  amount: bid.amount,
                  bidder: bid.bidder,
                  timestamp: new Date(bid.timestamp)
                }));
                
                return {
                  ...prev,
                  [auction.id]: {
                    ...auctionData,
                    recentBids: formattedHistory.slice(0, 5)
                  }
                };
              });
            }
          }
        } catch (error) {
          console.error(`Error syncing auction ${auction.id}:`, error);
        }
      });
      
      // Wait for all sync operations to complete
      await Promise.all(syncPromises);
      
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

  // Function to force synchronize bids for all active auctions
  const syncBids = async () => {
    logEvent('sync_bids_manual', 'Manual synchronization started');
    
    try {
      // First, check socket connection
      const socket = getSocket();
      if (!socket.connected) {
        logEvent('sync_bids_reconnect', 'Socket not connected, connecting...');
        socket.connect();
        
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!socket.connected) {
          logEvent('sync_bids_error', 'Failed to connect socket');
          toast({
            title: "Connection Error",
            description: "Could not connect to real-time server. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Get fresh product data from API
      logEvent('sync_bids_fetch_products', 'Fetching fresh product data from API');
      if (user?.id) {
        await fetchProducts({ farmer: user.id, isAuction: true });
      } else {
        logEvent('sync_bids_error', 'No user ID available for fetching products');
      }
      
      // For each active auction, directly request the latest state
      const syncPromises = activeAuctions.map(async (auction) => {
        try {
          logEvent('sync_auction_state', { auctionId: auction.id });
          
          // Rejoin the auction room first
          socket.emit('auction:join', { auctionId: auction.id });
          socket.emit('auction:join', auction.id);
          
          // Use the utility function to get auction state
          const stateResult = await syncAuctionState(auction.id);
          logEvent('sync_auction_result', { 
            auctionId: auction.id, 
            success: !!stateResult?.success,
            bidCount: stateResult?.bidHistory?.length || 0 
          });
          
          if (stateResult && stateResult.success) {
            // Apply state updates to both the auction product and live data
            if (stateResult.product && stateResult.product.currentBid) {
              // Update in auction products list
              setAuctionProducts(prev => 
                prev.map(p => p.id === auction.id 
                  ? { 
                      ...p, 
                      currentBid: stateResult.product.currentBid,
                      bidder: stateResult.product.bidder 
                    }
                  : p
                )
              );
              
              // Update in active auctions list
              setActiveAuctions(prev => 
                prev.map(p => p.id === auction.id 
                  ? { 
                      ...p, 
                      currentBid: stateResult.product.currentBid,
                      bidder: stateResult.product.bidder 
                    }
                  : p
                )
              );
            }
            
            // Apply bid history updates
            if (stateResult.bidHistory && stateResult.bidHistory.length > 0) {
              const formattedHistory = stateResult.bidHistory.map(bid => ({
                amount: bid.amount,
                bidder: typeof bid.bidder === 'object' ? bid.bidder.name : bid.bidder || 'Anonymous',
                timestamp: new Date(bid.timestamp)
              }));
              
              // Update live data with this history
              setLiveData(prev => ({
                ...prev,
                [auction.id]: {
                  participants: prev[auction.id]?.participants || 1,
                  recentBids: formattedHistory.slice(0, 5)
                }
              }));
              
              // Generate notification for the latest bid if it's new
              if (formattedHistory.length > 0) {
                const latestBid = formattedHistory[0];
                const product = activeAuctions.find(p => p.id === auction.id);
                
                if (product) {
                  // Add to notifications list
                  setBidNotifications(prev => {
                    // Check if we already have this notification by comparing amount, bidder and approximate time
                    const alreadyExists = prev.some(notification => 
                      notification.productId === auction.id &&
                      notification.amount === latestBid.amount &&
                      notification.bidder === latestBid.bidder &&
                      Math.abs(notification.timestamp.getTime() - latestBid.timestamp.getTime()) < 5000
                    );
                    
                    if (alreadyExists) {
                      return prev;
                    }
                    
                    // This is a new notification, add it to the list
                    return [{
                      productId: auction.id,
                      productName: product.name,
                      bidder: latestBid.bidder,
                      amount: latestBid.amount,
                      timestamp: latestBid.timestamp,
                      seen: false
                    }, ...prev].slice(0, 10);
                  });
                }
              }
            }
          }
        } catch (error) {
          logEvent('sync_auction_error', { auctionId: auction.id, error: error.message });
          console.error(`Error syncing auction ${auction.id}:`, error);
        }
      });
      
      await Promise.all(syncPromises);
      
      toast({
        title: "Sync Complete",
        description: "Latest bid information has been synchronized",
      });
      
      logEvent('sync_bids_complete', { auctionCount: activeAuctions.length });
    } catch (error) {
      logEvent('sync_bids_error', { error: error.message });
      console.error("Error during bid synchronization:", error);
      
      toast({
        title: "Sync Failed",
        description: "Could not synchronize latest bid information",
        variant: "destructive",
      });
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
    logEvent('socket_status', { connected: socket.connected, id: socket.id });
    
    // Handler for the auction:bid event
    const handleBid = (data) => {
      logEvent('bid_received', data);
      const { auctionId, amount, bidder, timestamp } = data;
      
      if (!auctionId || !amount) {
        console.warn('Received invalid bid event data:', data);
        return;
      }
      
      // Force refresh products from API to ensure we have latest data
      fetchProducts({ farmer: user?.id, isAuction: true }).catch(err => 
        console.error("Error refreshing products after bid:", err)
      );
      
      // Update live data for the auction
      setLiveData(prev => {
        const auctionData = prev[auctionId] || { participants: 0, recentBids: [] };
        
        // Extract bidder name from different possible data structures
        const bidderName = typeof bidder === 'object' ? 
                         (bidder?.name || 'Anonymous') : 
                         typeof bidder === 'string' ? bidder : 'Anonymous';
        
        // Create a timestamp that's definitely a Date object
        const bidTime = timestamp ? new Date(timestamp) : new Date();
        
        console.log(`Processing bid from ${bidderName} for amount ${amount} on auction ${auctionId}`);
        
        return {
          ...prev,
          [auctionId]: {
            ...auctionData,
            recentBids: [
              { amount, bidder: bidderName, timestamp: bidTime },
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
      
      // Find product name for the notification
      const product = products.find(p => p.id === auctionId);
      if (product) {
        const bidderName = typeof bidder === 'object' ? 
                        (bidder?.name || 'Anonymous') : 
                        typeof bidder === 'string' ? bidder : 'Anonymous';
        
        // Set active notification for animation
        setActiveNotification({
          productId: auctionId,
          productName: product.name,
          bidder: bidderName,
          amount: amount,
          timestamp: new Date(timestamp || new Date()),
          productImage: product.images && product.images.length > 0 ? product.images[0] : undefined
        });

        // Add to notifications list
        setBidNotifications(prev => [
          {
            productId: auctionId,
            productName: product.name,
            bidder: bidderName,
            amount: amount,
            timestamp: new Date(timestamp || new Date()),
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

    // Remove any existing listener before adding a new one to prevent duplicates
    socket.off("auction:bid");
    socket.on("auction:bid", handleBid);
    
    // Global event handler to receive bid events from any source
    const globalBidHandler = (event) => {
      if (event && event.detail && event.detail.bidData) {
        console.log('FARMER DASHBOARD: Received global bid event:', event.detail.bidData);
        handleBid(event.detail.bidData);
      }
    };
    
    // Add global event listener
    window.addEventListener('farm:newBid', globalBidHandler);

    // Also register for stateUpdate events that might contain bid information
    socket.off("auction:stateUpdate");
    socket.on("auction:stateUpdate", (data) => {
      console.log('FARMER DASHBOARD: Received auction state update:', data);
      if (data && data.auctionId && data.product) {
        // Update product data from the state update
        const { auctionId, product: updatedProduct, bidHistory } = data;
        
        // Update product in our state lists
        if (updatedProduct && updatedProduct.currentBid) {
          // Update auction products list
          setAuctionProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === auctionId
                ? {
                    ...product,
                    currentBid: updatedProduct.currentBid,
                    bidder: updatedProduct.bidder
                  }
                : product
            )
          );
          
          // Update active auctions
          setActiveAuctions(prev => 
            prev.map(product => 
              product.id === auctionId
                ? {
                    ...product,
                    currentBid: updatedProduct.currentBid,
                    bidder: updatedProduct.bidder
                  }
                : product
            )
          );
        }
        
        // If we have bid history, update it
        if (bidHistory && bidHistory.length > 0) {
          setLiveData(prev => {
            const auctionData = prev[auctionId] || { participants: 0, recentBids: [] };
            return {
              ...prev,
              [auctionId]: {
                ...auctionData,
                recentBids: bidHistory.slice(0, 5)
              }
            };
          });
        }
      }
    });
    
    // Handler for participant updates
    const handleParticipantUpdate = (data) => {
      console.log('FARMER DASHBOARD: Received participant update:', data);
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

    socket.off("auction:update");
    socket.on("auction:update", handleParticipantUpdate);
    
    // Ensure socket connection
    if (!socket.connected) {
      console.log('LiveBidding: Socket not connected on mount, connecting...');
      socket.connect();
      
      // After connecting, fetch current state of all auctions
      setTimeout(() => {
        if (socket.connected) {
          console.log('Fetching current state for all active auctions...');
          activeAuctions.forEach(auction => {
            socket.emit('auction:getState', { auctionId: auction.id }, (response) => {
              console.log(`Got state for auction ${auction.id}:`, response);
              if (response && response.success) {
                // Process the state data
                if (response.product && response.product.currentBid) {
                  // Update product in our lists
                  setActiveAuctions(prev => 
                    prev.map(p => p.id === auction.id 
                      ? { ...p, currentBid: response.product.currentBid, bidder: response.product.bidder }
                      : p
                    )
                  );
                }
                
                // Update bid history
                if (response.bidHistory && response.bidHistory.length > 0) {
                  setLiveData(prev => {
                    const auctionData = prev[auction.id] || { participants: 0, recentBids: [] };
                    return {
                      ...prev,
                      [auction.id]: {
                        ...auctionData,
                        recentBids: response.bidHistory.slice(0, 5)
                      }
                    };
                  });
                }
              }
            });
          });
        }
      }, 1000);
    }

    // Setup connection status handler
    const handleConnect = () => {
      console.log('Socket connected event fired');
      
      // Rejoin auction rooms for active auctions
      activeAuctions.forEach(auction => {
        console.log(`Rejoining auction room after reconnect: ${auction.id}`);
        socket.emit("auction:join", { auctionId: auction.id });
        socket.emit("auction:join", auction.id);
        
        // After joining, request latest state
        setTimeout(() => {
          socket.emit('auction:getState', { auctionId: auction.id }, (response) => {
            console.log(`Got state after reconnect for auction ${auction.id}:`, response);
            // Process state data as above
          });
        }, 500);
      });
    };

    socket.off("connect");
    socket.on('connect', handleConnect);

    // Check connection status regularly and refresh products
    const connectionInterval = setInterval(() => {
      if (!socket.connected) {
        console.log('LiveBidding: Socket disconnected, attempting to reconnect...');
        socket.connect();
      } else {
        // Refresh products every minute to ensure we have latest data
        if (user?.id) {
          fetchProducts({ farmer: user.id, isAuction: true }).catch(err => 
            console.error("Error refreshing products:", err)
          );
        }
      }
    }, 30000); // Check every 30 seconds
    
    // Create a general socket event logger
    const logSocketEvent = (eventName) => (data) => {
      logEvent(`socket_${eventName}`, data);
    };

    // Add listeners for all relevant socket events to help with debugging
    socket.on('connect', () => {
      logEvent('socket_connect', { id: socket.id });
    });
    
    socket.on('disconnect', (reason) => {
      logEvent('socket_disconnect', { reason });
    });
    
    socket.on('connect_error', (error) => {
      logEvent('socket_connect_error', { message: error.message });
    });
    
    socket.on('error', (error) => {
      logEvent('socket_error', { message: error.message });
    });

    // Register for other auction events
    socket.on('auction:joined', logSocketEvent('auction_joined'));
    socket.on('auction:left', logSocketEvent('auction_left'));
    socket.on('auction:error', logSocketEvent('auction_error'));
    
    return () => {
      socket.off("auction:bid", handleBid);
      socket.off("auction:update", handleParticipantUpdate);
      socket.off("auction:stateUpdate");
      socket.off('connect', handleConnect);
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('auction:joined');
      socket.off('auction:left');
      socket.off('auction:error');
      window.removeEventListener('farm:newBid', globalBidHandler);
      clearInterval(connectionInterval);
    };
  }, [products, activeAuctions, toast, user?.id, fetchProducts]);

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

  // Render sync button
  const renderSyncButton = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    
    const handleSync = async () => {
      logEvent('sync_button_clicked', 'User manually requested bid synchronization');
      setIsSyncing(true);
      try {
        await syncBids();
      } finally {
        setIsSyncing(false);
      }
    };
    
    return (
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">Not seeing latest bids?</h3>
              <p className="text-sm text-amber-700">Use the sync button to manually fetch the latest bid data</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-white text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Bids Now
              </>
            )}
          </Button>
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
        productsToShow = activeAuctions;
        emptyMessage = "You have no active auctions.";
    }
    
    return (
      <div className="space-y-6">
        {selectedTab === "active" && renderSyncButton()}
        
        {productsToShow.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed text-gray-500">
            <Gavel className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>{emptyMessage}</p>
            {selectedTab === "active" && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => navigate("/farmer/products/new")}
              >
                Create an auction product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsToShow.map(product => renderAuctionCard(product))}
          </div>
        )}
      </div>
    );
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
    
    // Create test bidder with complete information
    const testBidder = {
      id: "test-user-" + Math.floor(Math.random() * 1000),
      name: "Test Bidder " + Math.floor(Math.random() * 100),
      email: "test@example.com"
    };
    
    // Create comprehensive bid data with all required fields
    const bidData = {
      auctionId: productId,
      amount: bidAmount,
      userId: testBidder.id,
      bidder: testBidder,
      timestamp: new Date().toISOString()
    };
    
    console.log(`LiveBidding: Simulating test bid:`, bidData);
    
    // First dispatch the global event
    window.dispatchEvent(new CustomEvent('farm:newBid', {
      detail: { bidData }
    }));
    
    // Update product in local state immediately to show the bid
    const updatedProduct = {
      ...product,
      currentBid: bidAmount,
      bidder: testBidder
    };
    
    // Dispatch product update event
    window.dispatchEvent(new CustomEvent('farm:productUpdated', {
      detail: { product: updatedProduct }
    }));
    
    // Update local state to show the bid immediately
    setAuctionProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId
          ? { ...p, currentBid: bidAmount, bidder: testBidder }
          : p
      )
    );
    
    // Update active auctions too
    setActiveAuctions(prev => 
      prev.map(p => 
        p.id === productId
          ? { ...p, currentBid: bidAmount, bidder: testBidder }
          : p
      )
    );
    
    // Also emit via socket to inform server and other clients
    socket.emit('auction:bid', bidData, (response: any) => {
      console.log("Test bid response:", response);
      
      if (response && response.success) {
        toast({
          title: "Test bid sent",
          description: `Simulated bid of ${formatCurrency(bidAmount)} on ${product.name}`,
        });
      } else {
        console.log("Socket emit failed, trying API as fallback");
        
        // Try API as fallback
        productService.placeBid(productId, bidAmount)
          .then(updatedProduct => {
            console.log("API test bid successful:", updatedProduct);
            toast({
              title: "Test bid sent via API",
              description: `Simulated bid of ${formatCurrency(bidAmount)} on ${product.name}`,
            });
          })
          .catch(error => {
            console.error("API test bid failed:", error);
            
            // Toast even if API fails, since we already updated UI
            toast({
              title: "Test bid applied locally",
              description: `Simulated bid of ${formatCurrency(bidAmount)} on ${product.name}. Server sync may have failed.`,
            });
          });
      }
    });
    
    // Always update the bid history
    const auctionData = liveData[productId] || { participants: 0, recentBids: [] };
    setLiveData(prev => ({
      ...prev,
      [productId]: {
        ...auctionData,
        recentBids: [
          { amount: bidAmount, bidder: testBidder.name, timestamp: new Date() },
          ...auctionData.recentBids
        ].slice(0, 5)
      }
    }));
  };

  // Add this new component for debugging
  const DebugPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [events, setEvents] = useState<Array<{
      type: string;
      timestamp: string;
      data: any;
    }>>([]);
    
    useEffect(() => {
      const originalLogEvent = window.console.log;
      
      // Override logEvent to capture debug info
      const captureEvent = (type, data) => {
        const timestamp = new Date().toISOString();
        setEvents(prev => [{
          type,
          timestamp,
          data: typeof data === 'object' ? JSON.stringify(data) : String(data)
        }, ...prev].slice(0, 50)); // Keep last 50 events
        
        originalLogEvent(`[${timestamp}] FARMER DASHBOARD EVENT - ${type}:`, data);
      };
      
      // Replace the global logEvent function
      window.logEvent = captureEvent;
      
      return () => {
        // Restore original if needed
        window.console.log = originalLogEvent;
      };
    }, []);
    
    if (!isOpen) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 right-4 bg-gray-100 text-gray-700 border border-gray-300 p-2 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Debug
        </Button>
      );
    }
    
    return (
      <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-2/3 bg-gray-800 text-gray-200 z-50 rounded-t-lg overflow-hidden shadow-lg">
        <div className="flex justify-between items-center bg-gray-900 p-2">
          <div className="text-sm font-bold">LiveBidding Debug Panel</div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-1 text-xs text-gray-400 hover:text-white"
              onClick={() => setEvents([])}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-1 text-xs text-gray-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
        
        <div className="h-full overflow-auto p-2 text-xs font-mono">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center p-4">No events captured yet</div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="mb-2 border-b border-gray-700 pb-1">
                <div className="flex justify-between">
                  <span className={`font-semibold ${event.type.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
                    {event.type}
                  </span>
                  <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="whitespace-pre-wrap text-gray-300 mt-1">{event.data}</div>
              </div>
            ))
          )}
        </div>
      </div>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncBids}
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
      
      {/* Add the debug panel to the main component's return JSX */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </div>
  );
};

export default LiveBidding; 