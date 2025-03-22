import { api } from './api';

// Product interface that matches our API response
export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  images: string[];
  farmer: string | {
    _id: string;
    name: string;
    profileImage: string;
    email?: string;
    phone?: string;
  };
  farmerId: string;
  farmerName: string;
  quantity: number;
  isOrganic: boolean;
  organic: boolean;
  isAvailable: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  harvestDate?: string;
  bidding: boolean;
  startingBid?: number;
  currentBid?: number;
  endBidTime?: string | null;
  bidder?: string;
}

// Input interface for creating/updating products
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number; 
  unit: string;
  category: string;
  isOrganic: boolean;
  isAvailable: boolean;
  bidding?: boolean;
  startingBid?: number;
  currentBid?: number;
  endBidTime?: Date | string;
  images?: string[] | File[];
}

// Product filters interface
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
}

// Transform API product to frontend product format
const transformProduct = (apiProduct: any): Product => {
  console.log('Transforming product data:', apiProduct);
  
  // Create a safe transformed product object
  const transformedProduct = {
    ...apiProduct,
    // Ensure consistent ID field
    id: apiProduct._id || apiProduct.id || '',
    _id: apiProduct._id || apiProduct.id || '',
    // Map backend fields to frontend fields
    farmerId: apiProduct.farmer?._id || apiProduct.farmer || '',
    farmerName: apiProduct.farmer?.name || 'Unknown Farmer',
    quantity: apiProduct.stock || 0,
    organic: apiProduct.isOrganic || false,
    harvestDate: apiProduct.harvestDate || null,
    // Handle auction/bidding fields
    bidding: Boolean(apiProduct.bidding),
    currentBid: Number(apiProduct.currentBid || 0),
    startingBid: Number(apiProduct.startingBid || 0),
    endBidTime: apiProduct.endBidTime || null,
    // Handle bidder data safely - could be object or string ID
    bidder: apiProduct.bidder || null
  };

  console.log('Transformed product:', transformedProduct);
  return transformedProduct;
};

// Product service with real API integration
export const productService = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    try {
      // Build query parameters
      let queryParams = '';
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.category) {
          params.append('category', filters.category);
        }
        
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        if (filters.minPrice !== undefined) {
          params.append('price[gte]', filters.minPrice.toString());
        }
        
        if (filters.maxPrice !== undefined) {
          params.append('price[lte]', filters.maxPrice.toString());
        }
        
        if (filters.isOrganic !== undefined) {
          params.append('isOrganic', filters.isOrganic.toString());
        }
        
        queryParams = `?${params.toString()}`;
      }
      
      const response = await api.get(`/products${queryParams}`);
      
      if (response.success && response.data) {
        // Transform each product to frontend format
        return response.data.map(transformProduct);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
  
  // Get product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/${id}`);
      
      if (response.success && response.data) {
        return transformProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  },
  
  // Create a new product (farmer only)
  createProduct: async (productData: ProductInput): Promise<Product | null> => {
    try {
      const response = await api.post('/products', productData, true);
      
      if (response.success && response.data) {
        return transformProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update an existing product (farmer only)
  updateProduct: async (id: string, productData: ProductInput): Promise<Product | null> => {
    try {
      const response = await api.put(`/products/${id}`, productData, true);
      
      if (response.success && response.data) {
        return transformProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a product (farmer only)
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/products/${id}`, true);
      
      return response.success === true;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/category/${category}`);
      
      if (response.success && response.data) {
        return response.data.map(transformProduct);
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      return [];
    }
  },
  
  // Get farmer's products
  getFarmerProducts: async (farmerId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/farmer/${farmerId}`);
      
      if (response.success && response.data) {
        return response.data.map(transformProduct);
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching products for farmer ${farmerId}:`, error);
      return [];
    }
  },
  
  // Place a bid on an auction product
  placeBid: async (productId: string, bidAmount: number): Promise<Product | null> => {
    try {
      console.log(`[ProductService] Placing bid of ${bidAmount} on product ${productId}`);
      
      // Validate inputs before making the API call
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      if (!bidAmount || bidAmount <= 0) {
        throw new Error('Bid amount must be greater than zero');
      }
      
      // Make the API call with better error handling
      const response = await api.post(
        `/products/${productId}/bid`, 
        { bidAmount: bidAmount }, 
        true // Requires authentication
      );
      
      console.log(`[ProductService] Bid API response:`, response);
      
      if (response.success && response.data) {
        const transformedProduct = transformProduct(response.data);
        console.log(`[ProductService] Bid successful, updated product:`, transformedProduct);
        return transformedProduct;
      } else {
        console.error(`[ProductService] Bid API returned success=false:`, response);
        throw new Error(response.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error(`[ProductService] Error placing bid on product ${productId}:`, error);
      throw error;
    }
  }
};
