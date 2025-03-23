import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { 
  User, Lock, Mail, Phone, MapPin, Save, Camera, Loader2,
  CreditCard, Gift, History, Heart, ShoppingBag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConsumerProfile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210', // Mock data
    address: '123 Main Street, Bangalore, Karnataka', // Mock data
    alternateAddress: '456 Park Avenue, Bangalore, Karnataka', // Mock data
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sample orders data for the orders tab
  const orders = [
    { id: 'ORD-001', date: '2023-10-15', status: 'Delivered', total: '₹1,250' },
    { id: 'ORD-002', date: '2023-11-02', status: 'Processing', total: '₹2,100' },
    { id: 'ORD-003', date: '2023-12-10', status: 'Delivered', total: '₹750' },
  ];

  // Sample wishlist data
  const wishlist = [
    { id: 1, name: 'Organic Tomatoes', price: '₹125/kg', farmer: 'Green Farm' },
    { id: 2, name: 'Fresh Apples', price: '₹210/kg', farmer: 'Himalaya Orchards' },
    { id: 3, name: 'Honey (Raw)', price: '₹450/bottle', farmer: 'Mountain Apiaries' },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log('File uploaded:', e.target.files?.[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message or handle error
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          My Profile
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <Tabs 
        defaultValue="profile" 
        onValueChange={setActiveTab}
        className={`transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="wishlist" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            <Heart className="h-4 w-4 mr-2" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="data-[state=active]:bg-farm-green-100 data-[state=active]:text-farm-green-900 transition-all"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`col-span-1 transition-all duration-300 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardContent className="pt-6 flex flex-col items-center">
                <div 
                  className="relative" 
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <Avatar className="h-32 w-32 transition-all duration-300 hover:shadow-md border-4 border-white shadow">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&auto=format&fit=crop" alt={user?.name || 'User'} />
                    <AvatarFallback className="text-3xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div 
                    className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 ${avatarHover ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    title="Upload profile picture"
                    aria-label="Upload profile picture"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{profileData.name}</h3>
                <p className="text-gray-500">{profileData.email}</p>
                <Badge className="mt-2 bg-farm-green-100 text-farm-green-800 hover:bg-farm-green-200 transition-colors">Consumer</Badge>
                
                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-farm-green-600" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-farm-green-600" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-farm-green-600" />
                    <span>{profileData.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`col-span-2 transition-all duration-300 delay-300 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <CardTitle className="flex items-center text-farm-green-700">
                  <User className="h-5 w-5 mr-2 text-farm-green-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative group">
                      <Input 
                        id="name" 
                        name="name" 
                        value={profileData.name} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <User className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative group">
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={profileData.email} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <Mail className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative group">
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={profileData.phone} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <Phone className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="address">Primary Address</Label>
                  <div className="relative group">
                    <Input 
                      id="address" 
                      name="address" 
                      value={profileData.address} 
                      onChange={handleInputChange} 
                      className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                    />
                    <MapPin className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternateAddress">Alternate Address</Label>
                  <div className="relative group">
                    <Input 
                      id="alternateAddress" 
                      name="alternateAddress" 
                      value={profileData.alternateAddress} 
                      onChange={handleInputChange} 
                      className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                    />
                    <MapPin className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <Button 
                    className="group relative overflow-hidden bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 w-3 bg-white bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`col-span-3 transition-all duration-300 delay-400 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <CardTitle className="flex items-center text-farm-green-700">
                  <Lock className="h-5 w-5 mr-2 text-farm-green-600" />
                  Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative group">
                      <Input 
                        id="currentPassword" 
                        name="currentPassword" 
                        type="password" 
                        value={profileData.currentPassword} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative group">
                      <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type="password" 
                        value={profileData.newPassword} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative group">
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password" 
                        value={profileData.confirmPassword} 
                        onChange={handleInputChange} 
                        className="transition-all duration-300 border-gray-300 group-hover:border-farm-green-500 focus:border-farm-green-500 focus:ring-farm-green-500"
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div>
                  <Button 
                    variant="outline" 
                    className="group relative overflow-hidden border-farm-green-600 text-farm-green-700 hover:text-farm-green-800 hover:bg-farm-green-50 transform hover:scale-105 transition-all duration-300"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 w-3 bg-farm-green-600 bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className={`transition-all duration-300 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-farm-green-700">
                <ShoppingBag className="h-5 w-5 mr-2 text-farm-green-600" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded border border-gray-200 hover:border-farm-green-300 hover:shadow transition-all duration-300 transform hover:-translate-y-1"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-farm-green-700 font-medium">{order.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>You haven't placed any orders yet</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-center relative overflow-hidden border-farm-green-600 text-farm-green-700 hover:text-farm-green-800 hover:bg-farm-green-50 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 w-3 bg-farm-green-600 bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                  <History className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          <Card className={`transition-all duration-300 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-farm-green-700">
                <Heart className="h-5 w-5 mr-2 text-farm-green-600" />
                Saved Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wishlist.length > 0 ? (
                  wishlist.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded border border-gray-200 hover:border-farm-green-300 hover:shadow transition-all duration-300 transform hover:-translate-y-1"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">By {item.farmer}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-farm-green-700 font-medium">{item.price}</span>
                        <Button size="sm" className="bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300">
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Heart className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>Your wishlist is empty</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card className={`transition-all duration-300 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-farm-green-700">
                <CreditCard className="h-5 w-5 mr-2 text-farm-green-600" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-gray-500">
                <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No payment methods added yet</p>
                <Button 
                  className="mt-4 bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(45deg);
          }
          100% {
            transform: translateX(200%) skewX(45deg);
          }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ConsumerProfile; 