import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMarketplace } from "@/context/MarketplaceContext";
import ProductCard from "@/components/products/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const categories = [
  "All Categories",
  "Fruits",
  "Vegetables",
  "Dairy & Eggs",
  "Meat",
  "Herbs",
  "Grains",
  "Honey",
];

// Backend category mapping - maps UI categories to backend values
const categoryMapping: Record<string, string> = {
  "Fruits": "fruits",
  "Vegetables": "vegetables",
  "Dairy & Eggs": "dairy",
  "Meat": "meat", 
  "Herbs": "other",
  "Grains": "grains",
  "Honey": "other"
};

const Marketplace = () => {
  const { products, fetchProducts, isLoading } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract search query from URL params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("search");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [location.search]);
  
  // Fetch products on mount and when filters change
  useEffect(() => {
    const filters: any = {};
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    if (selectedCategory && selectedCategory !== "All Categories") {
      // Map UI category to backend category
      filters.category = categoryMapping[selectedCategory] || selectedCategory.toLowerCase();
    }
    
    if (organicOnly) {
      filters.isOrganic = true;
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 100) {
      filters.minPrice = priceRange[0];
      filters.maxPrice = priceRange[1];
    }
    
    console.log("Applying filters:", filters);
    fetchProducts(filters);
  }, [searchQuery, selectedCategory, organicOnly, priceRange, fetchProducts]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search parameter
    navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleSortChange = (value: string) => {
    // This would normally update sort order in a real app
    console.log("Sort changed to:", value);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 100]);
    setSelectedCategory("All Categories");
    setOrganicOnly(false);
    navigate("/marketplace");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Farm Fresh Marketplace</h1>
        <p className="text-gray-600">
          Discover quality produce directly from local farmers
        </p>
      </div>
      
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </form>
        
        <div className="flex gap-2">
          <Select onValueChange={handleSortChange} defaultValue="featured">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`md:w-1/4 lg:w-1/5 ${filtersOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </h3>
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-8 text-sm text-farm-green-600"
              >
                Clear All
              </Button>
            </div>
            
            <Accordion type="multiple" defaultValue={["category", "price", "certification"]}>
              <AccordionItem value="category">
                <AccordionTrigger>Category</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedCategory === category}
                          onCheckedChange={() => setSelectedCategory(category)}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${category}`} className="text-sm">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="certification">
                <AccordionTrigger>Certification</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center">
                    <Checkbox 
                      id="organic-only"
                      checked={organicOnly}
                      onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                      className="mr-2"
                    />
                    <label htmlFor="organic-only" className="text-sm">
                      Organic Products Only
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div>
              <p className="mb-4 text-gray-600">{products.length} products found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div key={product.id} className="h-[420px]">
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl mb-4">No products found</p>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
