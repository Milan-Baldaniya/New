// Mock order service - would be replaced with real API calls

interface Product {
  id: string;
  name: string;
  price: number;
  // Other product properties
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  trackingInfo?: any;
  paymentIntentId?: string;
}

export interface PaymentInfo {
  paymentMethodId?: string;
  paymentIntentId?: string;
  amount: number;
}

// Mock orders
const mockOrders: Order[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get current user ID
const getCurrentUserId = (): string => {
  const userString = localStorage.getItem("user");
  if (!userString) return "";

  try {
    const user = JSON.parse(userString);
    return user.id;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return "";
  }
};

export const orderService = {
  createOrder: async (cartItems: CartItem[], paymentIntentId?: string): Promise<string> => {
    // Simulate API delay
    await delay(1200);
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );
    
    // Create new order
    const newOrder: Order = {
      id: `order${Date.now()}`,
      userId,
      items: cartItems,
      status: 'pending',
      totalAmount,
      createdAt: new Date().toISOString(),
      paymentIntentId,
      trackingInfo: {
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: "Farm warehouse",
        updates: [
          {
            status: "Order received",
            timestamp: new Date().toISOString(),
            description: "Your order has been received and is being processed"
          }
        ]
      }
    };
    
    // Add to mock orders
    mockOrders.push(newOrder);
    
    return newOrder.id;
  },
  
  getOrders: async (): Promise<Order[]> => {
    // Simulate API delay
    await delay(800);
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Filter orders for current user
    return mockOrders.filter(order => order.userId === userId);
  },
  
  getOrderById: async (orderId: string): Promise<Order> => {
    // Simulate API delay
    await delay(500);
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const order = mockOrders.find(o => o.id === orderId && o.userId === userId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  },
  
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    // Simulate API delay
    await delay(700);
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    
    // Update order status
    const updatedOrder = {
      ...mockOrders[orderIndex],
      status,
      trackingInfo: {
        ...mockOrders[orderIndex].trackingInfo,
        updates: [
          ...mockOrders[orderIndex].trackingInfo?.updates || [],
          {
            status: `Order ${status}`,
            timestamp: new Date().toISOString(),
            description: `Your order has been ${status}`
          }
        ]
      }
    };
    
    mockOrders[orderIndex] = updatedOrder;
    
    return updatedOrder;
  },
  
  // Add more methods as needed
};
