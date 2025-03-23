import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { toast } from "@/components/ui/use-toast";
import { getSocket, placeBid as emitBid } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  farmerId: string;
  farmerName: string;
  images: string[];
  category: string;
  quantity: number;
  unit: string;
  harvestDate?: string;
  organic: boolean;
  bidding: boolean;
  startingBid?: number;
  currentBid?: number;
  endBidTime?: string;
  bidder?: any;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  trackingInfo?: any;
}

interface MarketplaceContextType {
  products: Product[];
  featuredProducts: Product[];
  cart: CartItem[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (filters?: any) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeBid: (productId: string, amount: number) => Promise<Product | null>;
  createOrder: () => Promise<string | null>;
  fetchOrders: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Track last cart update time to prevent rapid consecutive updates
  const lastCartUpdateRef = useRef<number>(0);

  // Load cart from localStorage on initialization
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Listen for bid updates from socket and global events
  useEffect(() => {
    // Get the socket instance
    const socket = getSocket();
    
    // Handle incoming bid updates from socket
    const handleBidUpdate = (data: any) => {
      const { auctionId, amount, bidder } = data;
      console.log(`MARKETPLACE CONTEXT: Received bid update for ${auctionId}: $${amount} by ${bidder?.name || 'Unknown'}`);
      
      // Update the product in state with the new bid information
      setProducts(prevProducts => 
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
      
      // Also update featured products
      setFeaturedProducts(prevFeatured => 
        prevFeatured.map(product => 
          product.id === auctionId
            ? {
                ...product,
                currentBid: amount,
                bidder: bidder
              }
            : product
        )
      );
      
      // Broadcast the update globally
      window.dispatchEvent(new CustomEvent('farm:newBid', {
        detail: { bidData: data }
      }));
    };
    
    // Add socket event listener
    socket.on('auction:bid', handleBidUpdate);
    
    // Also listen for global events (for cross-component updates)
    const handleGlobalBidEvent = (event: any) => {
      if (event && event.detail) {
        const data = event.detail;
        if (data.auctionId && data.amount) {
          handleBidUpdate(data);
        }
      }
    };
    
    // Add global event listener for auction:bid events
    window.addEventListener('auction:bid', handleGlobalBidEvent);
    
    // Listen for global product updates
    const handleProductUpdate = (event: any) => {
      if (event && event.detail && event.detail.product) {
        const updatedProduct = event.detail.product;
        if (!updatedProduct || !updatedProduct.id) return;
        
        console.log("MARKETPLACE CONTEXT: Received product update from global event:", updatedProduct);
        
        // Update products list
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );
        
        // Update featured products
        setFeaturedProducts(prevFeatured => 
          prevFeatured.map(product => 
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );
      }
    };
    
    // Add global event listener
    window.addEventListener('farm:productUpdated', handleProductUpdate);
    
    // Clean up listeners on unmount
    return () => {
      socket.off('auction:bid', handleBidUpdate);
      window.removeEventListener('auction:bid', handleGlobalBidEvent);
      window.removeEventListener('farm:productUpdated', handleProductUpdate);
    };
  }, []);

  // Add a periodic refresh for auction data
  useEffect(() => {
    // Only run if there are products in state
    if (products.length === 0) return;
    
    // Find auction products
    const auctionProducts = products.filter(p => p.bidding);
    if (auctionProducts.length === 0) return;
    
    console.log(`MARKETPLACE CONTEXT: Setting up periodic refresh for ${auctionProducts.length} auctions`);
    
    // Set up interval to refresh auction data
    const refreshInterval = setInterval(async () => {
      try {
        // Refresh each auction product
        for (const auction of auctionProducts) {
          try {
            const freshData = await productService.getProductById(auction.id);
            if (freshData) {
              // Update the product in state
              setProducts(prevProducts => 
                prevProducts.map(product => 
                  product.id === freshData.id
                    ? freshData
                    : product
                )
              );
              
              // Also update featured products
              setFeaturedProducts(prevFeatured => 
                prevFeatured.map(product => 
                  product.id === freshData.id
                    ? freshData
                    : product
                )
              );
            }
          } catch (error) {
            console.error(`Error refreshing auction ${auction.id}:`, error);
          }
        }
      } catch (error) {
        console.error("Error during auction refresh:", error);
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [products]);

  const fetchProducts = useCallback(async (filters?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching products with filters:", filters);
      
      // Special case for farmer products
      if (filters?.farmer) {
        console.log(`Fetching products for farmer ${filters.farmer}`);
        
        // Use the dedicated endpoint for farmer products
        let farmerProducts;
        
        try {
          // Try to get farmer products directly
          farmerProducts = await productService.getFarmerProducts(filters.farmer);
          console.log(`Retrieved ${farmerProducts.length} products for farmer ${filters.farmer}`);
        } catch (err) {
          console.error("Error using getFarmerProducts endpoint:", err);
          
          // Fallback to regular endpoint with farmer filter
          farmerProducts = await productService.getProducts({ farmer: filters.farmer });
          console.log(`Retrieved ${farmerProducts.length} products using regular endpoint with farmer filter`);
        }
        
        // Filter for auctions if requested
        if (filters.isAuction) {
          const auctionProducts = farmerProducts.filter(p => p.bidding === true);
          console.log(`Filtered to ${auctionProducts.length} auction products`);
          setProducts(auctionProducts);
        } else {
          setProducts(farmerProducts);
        }
        
        // Set featured products
        const featured = farmerProducts.filter(p => p.organic && p.quantity > 10).slice(0, 6);
        setFeaturedProducts(featured);
      } else {
        // Regular product fetching
        const data = await productService.getProducts(filters);
        setProducts(data);

        // Set featured products (could be based on different criteria)
        const featured = data.filter(p => p.organic && p.quantity > 10).slice(0, 6);
        setFeaturedProducts(featured);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductById = async (id: string): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const product = await productService.getProductById(id);
      if (!product) {
        setError("Product not found");
        return null;
      }
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product details. Please try again later.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback((product: Product, quantity: number) => {
    // Prevent rapid consecutive calls (debounce)
    const now = Date.now();
    if (now - lastCartUpdateRef.current < 500) {
      return; // Ignore clicks that happen too quickly
    }
    lastCartUpdateRef.current = now;
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);

      if (existingItemIndex !== -1) {
        // Update quantity if item already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, {
          productId: product.id,
          quantity,
          product
        }];
      }
    });

    toast({
      title: "Product added to cart",
      description: `${quantity} x ${product.name} added to your shopping cart.`,
    });
  }, [toast]);

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    
    toast({
      title: "Product removed",
      description: "Item removed from your shopping cart.",
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeBid = async (productId: string, amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place a bid",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }
    
    try {
      console.log(`Placing bid of $${amount} on product ${productId}`);
      
      // Get socket and ensure connection before proceeding
      const socket = getSocket();
      if (!socket.connected) {
        console.log("Socket not connected before bid, connecting...");
        socket.connect();
        
        // Short wait to allow connection
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if connection was established
        if (!socket.connected) {
          console.warn("Socket still not connected after connection attempt");
        }
      }
      
      // Call API first to record the bid in the database
      // This ensures the bid is saved even if socket fails
      try {
        const updatedProduct = await productService.placeBid(productId, amount);
        
        if (!updatedProduct) {
          console.warn("No product data returned after placing bid");
          throw new Error("No product data returned from bid");
        }
        
        console.log("Received updated product after bid:", updatedProduct);
        
        // Update the products list with the new bid information
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId
              ? { ...updatedProduct }
              : product
          )
        );
        
        // Also update featured products if this product is featured
        setFeaturedProducts(prevFeatured => 
          prevFeatured.map(product => 
            product.id === productId
              ? { ...updatedProduct }
              : product
          )
        );
        
        // Prepare comprehensive bid data with all necessary fields
        const bidData = {
          auctionId: productId,
          amount: amount,
          userId: user.id,
          bidder: {
            id: user.id,
            name: user.name || "Anonymous"
          },
          timestamp: new Date().toISOString()
        };
        
        // Ensure bid is broadcast via socket for real-time updates
        // Try multiple methods to increase reliability
        
        // Method 1: Direct socket emit with callback
        console.log("Broadcasting bid via direct socket emit:", bidData);
        socket.emit('auction:bid', bidData, (response: any) => {
          console.log("Socket bid direct response:", response);
          
          // If direct emit fails, try the fallback method
          if (!response || !response.success) {
            console.warn("Direct socket emit unsuccessful, trying library method");
            
            // Method 2: Use the library function as backup
            emitBid(productId, amount, user.id)
              .then(libResponse => console.log("Library method bid response:", libResponse))
              .catch(err => console.error("Library method bid failed:", err));
          }
        });
        
        // Method 3: Dispatch global custom event for other components
        console.log("Dispatching global bid event");
        window.dispatchEvent(new CustomEvent('farm:newBid', {
          detail: { bidData }
        }));
        
        // Also dispatch product update event
        window.dispatchEvent(new CustomEvent('farm:productUpdated', {
          detail: { product: updatedProduct }
        }));
        
        // Return the updated product
        return updatedProduct;
      } catch (apiError) {
        console.error("API bid error:", apiError);
        
        // If API fails but socket is connected, try socket bid as fallback
        if (socket.connected) {
          try {
            console.log("Attempting socket bid as fallback after API failure");
            
            // Create complete bid data
            const fallbackBidData = {
              auctionId: productId,
              amount: amount,
              userId: user.id,
              bidder: {
                id: user.id,
                name: user.name || "Anonymous"
              },
              timestamp: new Date().toISOString()
            };
            
            // Emit directly with full data
            socket.emit('auction:bid', fallbackBidData, (response: any) => {
              console.log("Fallback socket bid response:", response);
              
              // Also dispatch global event even in fallback
              if (response && response.success) {
                window.dispatchEvent(new CustomEvent('farm:newBid', {
                  detail: { bidData: fallbackBidData }
                }));
              }
            });
            
            // Also try library method
            const socketResponse = await emitBid(productId, amount, user.id);
            console.log("Fallback library method response:", socketResponse);
            
            // If socket bid succeeds, return a basic product update
            if (socketResponse && socketResponse.success) {
              const product = products.find(p => p.id === productId);
              if (product) {
                const updatedProduct = {
                  ...product,
                  currentBid: amount,
                  bidder: user
                };
                
                // Dispatch product update event even in fallback
                window.dispatchEvent(new CustomEvent('farm:productUpdated', {
                  detail: { product: updatedProduct }
                }));
                
                return updatedProduct;
              }
            }
          } catch (socketError) {
            console.error("Fallback socket bid also failed:", socketError);
          }
        }
        
        // Both API and socket failed
        throw apiError; 
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Bid failed",
        description: error instanceof Error ? error.message : "Failed to place bid. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const createOrder = async (): Promise<string | null> => {
    if (cart.length === 0) {
      toast({
        title: "Cannot create order",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return null;
    }

    try {
      const orderId = await orderService.createOrder(cart);
      clearCart();
      
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed.",
      });
      
      return orderId;
    } catch (error) {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const userOrders = await orderService.getOrders();
      setOrders(userOrders as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    products,
    featuredProducts,
    cart,
    orders,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    placeBid,
    createOrder,
    fetchOrders,
  };

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
};
