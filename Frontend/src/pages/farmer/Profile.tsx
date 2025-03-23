import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, Mail, Phone, MapPin, Save, Camera, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210', // Mock data
    farmName: 'Green Valley Farms', // Mock data
    address: '123 Rural Lane, Farmville, Karnataka', // Mock data
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log(e.target.files);
    // In a real app, you would upload this to a server
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would update the user profile via API
    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would update the password via API
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          My Profile
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>
      
      <div className={`flex flex-col lg:flex-row gap-6 transition-all duration-700 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="lg:w-1/3 space-y-4">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="flex items-center text-farm-green-700">
                <User className="h-5 w-5 mr-2 text-farm-green-600" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4"
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}>
                <Avatar className="w-40 h-40 border-4 border-farm-green-100 transition-all duration-300 hover:border-farm-green-300">
                  <AvatarImage src="https://i.pravatar.cc/300" alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-4xl bg-farm-green-100 text-farm-green-800">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute inset-0 bg-black/30 flex items-center justify-center rounded-full cursor-pointer transition-opacity duration-300 ${avatarHover ? 'opacity-100' : 'opacity-0'}`}
                  onClick={handleAvatarUpload}
                >
                  <Camera className="h-8 w-8 text-white transition-transform duration-300 hover:scale-110" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  title="Upload profile picture"
                />
              </div>

              <div className="text-center w-full space-y-1">
                <h3 className="font-semibold text-xl">{profileData.name}</h3>
                <p className="text-gray-500 flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-1" /> {profileData.email}
                </p>
                <p className="text-farm-green-700 bg-farm-green-50 py-1 px-3 rounded-full text-sm inline-block mt-1">Farmer</p>
              </div>
              
              <div className="mt-6 w-full pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 transition-all duration-300 hover:text-farm-green-700 hover:translate-x-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{profileData.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 transition-all duration-300 hover:text-farm-green-700 hover:translate-x-1">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-2/3 space-y-6">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="flex items-center text-farm-green-700">
                <User className="h-5 w-5 mr-2 text-farm-green-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="name" className="flex items-center">
                      <span>Full Name</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="email" className="flex items-center">
                      <span>Email Address</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="phone" className="flex items-center">
                      <span>Phone Number</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="farmName" className="flex items-center">
                      <span>Farm Name</span>
                    </Label>
                    <Input
                      id="farmName"
                      name="farmName"
                      value={profileData.farmName}
                      onChange={handleInputChange}
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                  <Label htmlFor="address" className="flex items-center">
                    <span>Farm Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    required
                    className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                  />
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden" 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center">
                          <Save className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                          Save Changes
                        </span>
                        <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className={`overflow-hidden transition-all duration-700 delay-300 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="flex items-center text-farm-green-700">
                <Lock className="h-5 w-5 mr-2 text-farm-green-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                  <Label htmlFor="currentPassword" className="flex items-center">
                    <span>Current Password</span>
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={profileData.currentPassword}
                    onChange={handleInputChange}
                    required
                    className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="newPassword" className="flex items-center">
                      <span>New Password</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
                    <Label htmlFor="confirmPassword" className="flex items-center">
                      <span>Confirm New Password</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="focus:border-farm-green-500 focus:ring-farm-green-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="pt-2 pb-2">
                  <p className="text-xs text-gray-500">
                    Password should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.
                  </p>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden" 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center">
                          <Save className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                          Update Password
                        </span>
                        <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 