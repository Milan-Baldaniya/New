import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  AreaChart, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Gavel, 
  ListFilter, 
  Plus, 
  Search, 
  Timer, 
  Users 
} from "lucide-react";
import { productService, Product } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";

interface AuctionProduct extends Product {
  bidCount: number;
  timeRemaining: string;
  status: 'active' | 'ended' | 'scheduled';
}

const FarmerAuctions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [auctionProducts, setAuctionProducts] = useState<AuctionProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AuctionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Stats for dashboard
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalBids: 0,
    totalBidValue: 0,
    averageBidIncrease: 0,
    highestBid: 0
  });
  
  // Mock data for demonstration
  useEffect(() => {
    const loadAuctionProducts = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, we would fetch the actual data
        // const response = await productService.getFarmerProducts(user.id);
        // const auctionProducts = response.filter(p => p.bidding);
        
        // Mock data for demonstration
        const mockAuctionProducts: AuctionProduct[] = [
          {
            _id: "1",
            id: "1",
            name: "Organic Apples",
            description: "Fresh organic apples from our orchard",
            price: 0, // Regular price not used for auctions
            category: "Fruits",
            stock: 50,
            unit: "kg",
            images: ["/apples.jpg"],
            farmer: user?.id || "",
            farmerId: user?.id || "",
            farmerName: user?.name || "Your Farm",
            quantity: 50,
            isOrganic: true,
            organic: true,
            isAvailable: true,
            rating: 4.5,
            numReviews: 12,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date().toISOString(),
            bidding: true,
            startingBid: 2.5,
            currentBid: 4.75,
            endBidTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            bidder: { _id: "user1", name: "John Doe" },
            // Auction-specific fields
            bidCount: 8,
            timeRemaining: "2 days",
            status: 'active'
          },
          {
            _id: "2",
            id: "2",
            name: "Premium Honey",
            description: "Pure wildflower honey, cold extracted",
            price: 0,
            category: "Honey",
            stock: 20,
            unit: "bottle",
            images: ["/honey.jpg"],
            farmer: user?.id || "",
            farmerId: user?.id || "",
            farmerName: user?.name || "Your Farm",
            quantity: 20,
            isOrganic: true,
            organic: true,
            isAvailable: true,
            rating: 5,
            numReviews: 7,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date().toISOString(),
            bidding: true,
            startingBid: 8,
            currentBid: 12.5,
            endBidTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            bidder: { _id: "user2", name: "Jane Smith" },
            bidCount: 5,
            timeRemaining: "5 days",
            status: 'active'
          },
          {
            _id: "3",
            id: "3",
            name: "Heirloom Tomatoes",
            description: "Assorted heirloom tomato varieties",
            price: 0,
            category: "Vegetables",
            stock: 30,
            unit: "kg",
            images: ["/tomatoes.jpg"],
            farmer: user?.id || "",
            farmerId: user?.id || "",
            farmerName: user?.name || "Your Farm",
            quantity: 30,
            isOrganic: true,
            organic: true,
            isAvailable: true,
            rating: 4.8,
            numReviews: 9,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date().toISOString(),
            bidding: true,
            startingBid: 3,
            currentBid: 3,
            endBidTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            bidder: null,
            bidCount: 0,
            timeRemaining: "7 days",
            status: 'scheduled'
          },
          {
            _id: "4",
            id: "4",
            name: "Fresh Eggs",
            description: "Free-range chicken eggs",
            price: 0,
            category: "Dairy & Eggs",
            stock: 100,
            unit: "dozen",
            images: ["/eggs.jpg"],
            farmer: user?.id || "",
            farmerId: user?.id || "",
            farmerName: user?.name || "Your Farm",
            quantity: 100,
            isOrganic: true,
            organic: true,
            isAvailable: true,
            rating: 4.9,
            numReviews: 15,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date().toISOString(),
            bidding: true,
            startingBid: 4,
            currentBid: 7.25,
            endBidTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            bidder: { _id: "user3", name: "Robert Brown" },
            bidCount: 12,
            timeRemaining: "Ended",
            status: 'ended'
          }
        ];
        
        setAuctionProducts(mockAuctionProducts);
        setFilteredProducts(mockAuctionProducts);
        
        // Calculate stats
        const activeCount = mockAuctionProducts.filter(p => p.status === 'active').length;
        const totalBids = mockAuctionProducts.reduce((sum, p) => sum + p.bidCount, 0);
        const totalBidValue = mockAuctionProducts.reduce((sum, p) => sum + (p.currentBid || 0), 0);
        const bidIncrease = mockAuctionProducts.reduce((sum, p) => 
          p.currentBid && p.startingBid ? sum + (p.currentBid - p.startingBid) : sum, 0);
        const averageIncrease = bidIncrease / activeCount || 0;
        const highestBid = Math.max(...mockAuctionProducts.map(p => p.currentBid || 0));
        
        setStats({
          activeAuctions: activeCount,
          totalBids,
          totalBidValue,
          averageBidIncrease: averageIncrease,
          highestBid
        });
      } catch (error) {
        console.error("Error loading auction products:", error);
        toast({
          title: "Error",
          description: "Failed to load auction products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuctionProducts();
  }, [user]);
  
  // Filter products when status filter or search term changes
  useEffect(() => {
    let filtered = [...auctionProducts];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(filtered);
  }, [statusFilter, searchTerm, auctionProducts]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };
  
  const handleCreateAuction = () => {
    navigate("/farmer/dashboard/add-product", { 
      state: { initialMode: "auction" } 
    });
  };
  
  const handleViewAuction = (id: string) => {
    navigate(`/live-bidding/${id}`);
  };
  
  const handleEditAuction = (id: string) => {
    navigate(`/farmer/dashboard/edit-product/${id}`, { 
      state: { isAuction: true } 
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Auction Management</h1>
          <p className="text-gray-500">Manage your product auctions and bids</p>
        </div>
        <Button onClick={handleCreateAuction} className="bg-farm-green-600 hover:bg-farm-green-700">
          <Plus className="h-4 w-4 mr-2" /> Create New Auction
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Gavel className="h-5 w-5 text-farm-green-600 mr-2" />
              <span className="text-2xl font-bold">{stats.activeAuctions}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-harvest-gold-600 mr-2" />
              <span className="text-2xl font-bold">{stats.totalBids}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Bid Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-fresh-blue-600 mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(stats.totalBidValue)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Bid Increase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AreaChart className="h-5 w-5 text-soil-brown-600 mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(stats.averageBidIncrease)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => handleStatusFilterChange("all")}>
              All Auctions
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => handleStatusFilterChange("active")}>
              Active
            </TabsTrigger>
            <TabsTrigger value="scheduled" onClick={() => handleStatusFilterChange("scheduled")}>
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="ended" onClick={() => handleStatusFilterChange("ended")}>
              Ended
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Bids</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                              <img 
                                src={product.images?.[0] || "/placeholder.jpg"} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.status === 'active'
                                ? 'bg-green-500'
                                : product.status === 'scheduled'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                            }
                          >
                            {product.status === 'active'
                              ? 'Active'
                              : product.status === 'scheduled'
                              ? 'Scheduled'
                              : 'Ended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.currentBid > product.startingBid ? (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(product.currentBid || 0)}
                            </span>
                          ) : (
                            <span>
                              {formatCurrency(product.startingBid || 0)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {product.bidCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {product.timeRemaining}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewAuction(product.id)}
                            >
                              View
                            </Button>
                            {product.status !== 'ended' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditAuction(product.id)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">No auction products found</p>
                          {searchTerm && (
                            <p className="text-gray-400 text-sm mt-1">
                              Try adjusting your search or filters
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          {/* Same table but filtered for active auctions */}
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-0">
          {/* Same table but filtered for scheduled auctions */}
        </TabsContent>
        
        <TabsContent value="ended" className="mt-0">
          {/* Same table but filtered for ended auctions */}
        </TabsContent>
      </Tabs>
      
      {/* Recent Bid Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bid Activity</CardTitle>
          <CardDescription>Latest bids on your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auctionProducts
              .filter(p => p.bidCount > 0)
              .slice(0, 5)
              .map((product, index) => (
                <div key={`${product.id}-${index}`} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                      {product.bidder?.name ? (
                        <span className="font-semibold text-sm">
                          {product.bidder.name.charAt(0)}
                        </span>
                      ) : (
                        <Users className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {product.bidder?.name || "Anonymous"} 
                        <span className="font-normal text-gray-500"> bid on </span> 
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        <Timer className="h-3 w-3 inline mr-1" />
                        {Math.floor(Math.random() * 24)} hours ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(product.currentBid || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.startingBid && product.currentBid ? (
                        <>+{formatCurrency(product.currentBid - product.startingBid)}</>
                      ) : (
                        "No previous bid"
                      )}
                    </p>
                  </div>
                </div>
              ))}
              
            {auctionProducts.filter(p => p.bidCount > 0).length === 0 && (
              <div className="flex flex-col items-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No bid activity yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Your auction bids will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="link" className="w-full">
            View All Bid Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FarmerAuctions; 