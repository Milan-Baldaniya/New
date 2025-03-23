import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Image, Tag, ListPlus, FileCheck, Loader2 } from 'lucide-react';
import { productService, ProductInput } from "@/services/productService";

const AddProduct = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: '',
    isOrganic: false,
    saleType: 'fixed', // 'fixed' or 'auction'
    auctionEndDate: '', // for auction items
    auctionEndTime: '', // for auction items
    minimumBid: '', // for auction items
    images: [] as File[]
  });

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: files }));
      
      // Create image preview for the first image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate auction fields if auction is selected
      if (formData.saleType === 'auction') {
        if (!formData.minimumBid || parseFloat(formData.minimumBid) <= 0) {
          throw new Error("Please provide a valid minimum bid amount");
        }
        if (!formData.auctionEndDate) {
          throw new Error("Please provide an auction end date");
        }
        if (!formData.auctionEndTime) {
          throw new Error("Please provide an auction end time");
        }
        
        // Check if end time is in the future
        const endDateTime = new Date(`${formData.auctionEndDate}T${formData.auctionEndTime}:00`);
        if (endDateTime <= new Date()) {
          throw new Error("Auction end time must be in the future");
        }
      }

      // Convert form data to product object
      const productData: ProductInput = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        isOrganic: formData.isOrganic,
        isAvailable: true,
        // If it's an auction item, add auction-specific fields
        ...(formData.saleType === 'auction' && {
          bidding: true,
          price: 0, // For auctions, we'll use startingBid instead of price
          startingBid: parseFloat(formData.minimumBid),
          currentBid: parseFloat(formData.minimumBid), // Set initial currentBid to match startingBid
          endBidTime: new Date(`${formData.auctionEndDate}T${formData.auctionEndTime}:00`)
        })
      };

      console.log('Submitting product data:', productData);
      
      // Create product using the product service API
      try {
        const createdProduct = await productService.createProduct(productData);
        console.log('Product created successfully:', createdProduct);
        
        if (createdProduct) {
          // Handle image upload if there are images
          if (formData.images.length > 0) {
            // Typically, you would upload the images to a server here
            // This would be handled by a separate API call
            console.log('Images would be uploaded here:', formData.images);
          }
          
          toast({
            title: "Product Added",
            description: "Your product has been successfully added to the marketplace.",
          });
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            price: '',
            quantity: '',
            unit: 'kg',
            category: '',
            isOrganic: false,
            saleType: 'fixed',
            auctionEndDate: '',
            auctionEndTime: '',
            minimumBid: '',
            images: []
          });
          setImagePreview(null);
        } else {
          throw new Error("Failed to create product - no product returned");
        }
      } catch (apiError: any) {
        console.error("API Error creating product:", apiError);
        toast({
          title: "API Error",
          description: apiError.message || "Failed to add product. Please check server logs.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Form validation error:", error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to add product. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          Add New Product
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">List your products in the marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`overflow-hidden border-gray-200 transition-all duration-700 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <ListPlus className="h-5 w-5 mr-2 text-farm-green-600" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                <Label htmlFor="name" className="flex items-center">
                  <span>Product Name</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                  placeholder="Enter your product name"
                />
              </div>
              <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                <Label htmlFor="category" className="flex items-center">
                  <span>Category</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="focus:border-farm-green-500 focus:ring-farm-green-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-down">
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="dairy">Dairy & Eggs</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="herbs">Herbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
              <Label htmlFor="description" className="flex items-center">
                <span>Description</span>
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[120px] focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                placeholder="Describe your product in detail"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <span>Sale Type</span>
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <RadioGroup
                defaultValue="fixed"
                value={formData.saleType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, saleType: value }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2 transition-all duration-300 hover:bg-farm-green-50 p-2 rounded-md">
                  <RadioGroupItem value="fixed" id="fixed" className="text-farm-green-600" />
                  <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
                </div>
                <div className="flex items-center space-x-2 transition-all duration-300 hover:bg-harvest-gold-50 p-2 rounded-md">
                  <RadioGroupItem value="auction" id="auction" className="text-harvest-gold-600" />
                  <Label htmlFor="auction" className="cursor-pointer">Auction</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.saleType === 'fixed' ? (
              <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                <Label htmlFor="price" className="flex items-center">
                  <span>Fixed Price (₹)</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="pl-7 focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    placeholder="Enter price"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                  <Label htmlFor="minimumBid" className="flex items-center">
                    <span>Minimum Bid (₹)</span>
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="minimumBid"
                      name="minimumBid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumBid}
                      onChange={handleInputChange}
                      required
                      className="pl-7 focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                      placeholder="Enter minimum bid amount"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="auctionEndDate" className="flex items-center">
                      <span>Auction End Date</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="auctionEndDate"
                      name="auctionEndDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.auctionEndDate}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="auctionEndTime" className="flex items-center">
                      <span>Auction End Time</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="auctionEndTime"
                      name="auctionEndTime"
                      type="time"
                      value={formData.auctionEndTime}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 transition-all duration-300 hover:translate-x-1 md:col-span-2">
                <Label htmlFor="quantity" className="flex items-center">
                  <span>Quantity</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                  placeholder="Enter available quantity"
                />
              </div>
              <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                <Label htmlFor="unit" className="flex items-center">
                  <span>Unit</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className="focus:border-farm-green-500 focus:ring-farm-green-500">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-down">
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 border border-gray-100 rounded-md bg-gray-50 transition-all duration-300 hover:bg-gray-100">
              <Switch
                id="organic"
                checked={formData.isOrganic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOrganic: checked }))}
                className="data-[state=checked]:bg-farm-green-600"
              />
              <Label htmlFor="organic" className="cursor-pointer">This is an organic product</Label>
              {formData.isOrganic && (
                <span className="ml-auto text-xs px-2 py-1 bg-farm-green-100 text-farm-green-800 rounded-full animate-bounce-subtle">
                  Eco-friendly
                </span>
              )}
            </div>
            
            <div className="pt-2">
              <Label htmlFor="images" className="flex items-center mb-2">
                <span>Product Images</span>
                <span className="text-red-500 ml-1">*</span>
                <span className="text-xs text-gray-500 ml-2">(Upload at least one image)</span>
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-farm-green-500 transition-colors group relative">
                <input 
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Upload product images"
                />
                <div className="text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-4 relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-40 rounded-md object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute bottom-2 right-2 bg-white/80 rounded-full px-2 py-0.5 text-xs">
                          {formData.images.length} selected
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Click or drag to change images</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-2 group-hover:text-farm-green-600 transition-colors animate-pulse-subtle" />
                      <p className="text-gray-600 mb-1">Click or drag and drop</p>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF (Max. 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`flex justify-end transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <Button 
            type="submit" 
            className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding Product...
              </span>
            ) : (
              <>
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                  Add Product to Marketplace
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 