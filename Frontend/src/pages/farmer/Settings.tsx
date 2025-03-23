import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/context/ThemeContext';
import { 
  BellRing, Moon, Sun, Languages, UserCog, Smartphone, Shield, 
  BellOff, Save, Check, Languages as LanguagesIcon, Loader2 
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newFeatures: true,
      deliveryUpdates: true,
    },
    display: {
      theme: theme as Theme,
      language: 'english',
    },
    privacy: {
      shareData: false,
      receiveEmails: true,
      locationTracking: false,
    },
    mobileSettings: {
      pushNotifications: true,
      dataUsage: 'wifi-only',
    },
  });

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsVisible(true);
  }, []);

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key],
      },
    }));
  };

  const handleMobileSettingChange = (key: keyof typeof settings.mobileSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      mobileSettings: {
        ...prev.mobileSettings,
        [key]: typeof value === 'boolean' ? value : value,
      },
    }));
  };

  const handleThemeChange = (value: Theme) => {
    setSettings((prev) => ({
      ...prev,
      display: {
        ...prev.display,
        theme: value,
      },
    }));
    setTheme(value);
  };

  const handleLanguageChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      display: {
        ...prev.display,
        language: value,
      },
    }));
  };

  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          Settings
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Customize your account preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`overflow-hidden transition-all duration-700 delay-100 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <BellRing className="h-5 w-5 mr-2 text-farm-green-600" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="orderUpdates" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Order Updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about your order status
                  </p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={settings.notifications.orderUpdates}
                  onCheckedChange={() => handleNotificationChange('orderUpdates')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>

              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Promotions & Offers
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified about deals and special offers
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={settings.notifications.promotions}
                  onCheckedChange={() => handleNotificationChange('promotions')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>

              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="newFeatures" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    New Features
                  </Label>
                  <p className="text-sm text-gray-500">
                    Stay updated with new platform features
                  </p>
                </div>
                <Switch
                  id="newFeatures"
                  checked={settings.notifications.newFeatures}
                  onCheckedChange={() => handleNotificationChange('newFeatures')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>

              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="deliveryUpdates" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Delivery Updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Track your deliveries with real-time updates
                  </p>
                </div>
                <Switch
                  id="deliveryUpdates"
                  checked={settings.notifications.deliveryUpdates}
                  onCheckedChange={() => handleNotificationChange('deliveryUpdates')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden transition-all duration-700 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <UserCog className="h-5 w-5 mr-2 text-farm-green-600" />
              Display Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <div className="flex items-center space-x-4">
                <div 
                  className={`relative flex items-center justify-center rounded-full p-2 w-10 h-10 cursor-pointer transition-all duration-300 ${settings.display.theme === 'light' ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-300' : 'bg-gray-200 text-gray-600 hover:bg-amber-50'}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                  {settings.display.theme === 'light' && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div 
                  className={`relative flex items-center justify-center rounded-full p-2 w-10 h-10 cursor-pointer transition-all duration-300 ${settings.display.theme === 'dark' ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300' : 'bg-gray-200 text-gray-600 hover:bg-indigo-50'}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                  {settings.display.theme === 'dark' && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div 
                  className={`relative flex items-center justify-center rounded-full p-2 w-10 h-10 cursor-pointer transition-all duration-300 ${settings.display.theme === 'system' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' : 'bg-gray-200 text-gray-600 hover:bg-blue-50'}`}
                  onClick={() => handleThemeChange('system')}
                >
                  <Smartphone className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                  {settings.display.theme === 'system' && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {settings.display.theme === 'light' 
                  ? 'Light theme: Bright and clear interface for daytime use' 
                  : settings.display.theme === 'dark' 
                  ? 'Dark theme: Easier on the eyes in low-light environments' 
                  : 'System theme: Follows your device settings'}
              </p>
            </div>

            <div className="space-y-2 relative group">
              <Label htmlFor="language-select" className="flex items-center">
                <span>Language</span>
              </Label>
              <Select
                value={settings.display.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language-select" className="w-full focus:border-farm-green-500 focus:ring-farm-green-500 transition-all duration-300 hover:border-farm-green-300">
                  <div className="flex items-center">
                    <LanguagesIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Select language" />
                  </div>
                </SelectTrigger>
                <SelectContent className="animate-fade-in-down">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="gujarati">Gujarati</SelectItem>
                  <SelectItem value="punjabi">Punjabi</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
            </div>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden transition-all duration-700 delay-300 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <Shield className="h-5 w-5 mr-2 text-farm-green-600" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="shareData" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Share Usage Data
                  </Label>
                  <p className="text-sm text-gray-500">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="shareData"
                  checked={settings.privacy.shareData}
                  onCheckedChange={() => handlePrivacyChange('shareData')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>

              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="receiveEmails" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive emails about products and services
                  </p>
                </div>
                <Switch
                  id="receiveEmails"
                  checked={settings.privacy.receiveEmails}
                  onCheckedChange={() => handlePrivacyChange('receiveEmails')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>

              <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="locationTracking" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                    Location Tracking
                  </Label>
                  <p className="text-sm text-gray-500">
                    Allow tracking your location for better service
                  </p>
                </div>
                <Switch
                  id="locationTracking"
                  checked={settings.privacy.locationTracking}
                  onCheckedChange={() => handlePrivacyChange('locationTracking')}
                  className="data-[state=checked]:bg-farm-green-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden transition-all duration-700 delay-400 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <Smartphone className="h-5 w-5 mr-2 text-farm-green-600" />
              Mobile App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between group transition-all duration-300 p-2 rounded-md hover:bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                  Push Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Enable mobile app push notifications
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.mobileSettings.pushNotifications}
                onCheckedChange={() => handleMobileSettingChange('pushNotifications', !settings.mobileSettings.pushNotifications)}
                className="data-[state=checked]:bg-farm-green-600"
              />
            </div>

            <div className="space-y-2 relative group">
              <Label htmlFor="dataUsage" className="text-base font-medium group-hover:text-farm-green-700 transition-colors duration-300">
                Data Usage
              </Label>
              <Select
                value={settings.mobileSettings.dataUsage}
                onValueChange={(value) => handleMobileSettingChange('dataUsage', value)}
              >
                <SelectTrigger id="dataUsage" className="w-full focus:border-farm-green-500 focus:ring-farm-green-500 transition-all duration-300 hover:border-farm-green-300">
                  <SelectValue placeholder="Select data usage" />
                </SelectTrigger>
                <SelectContent className="animate-fade-in-down">
                  <SelectItem value="always">Download data anytime</SelectItem>
                  <SelectItem value="wifi-only">Download on Wi-Fi only</SelectItem>
                  <SelectItem value="low">Low data usage mode</SelectItem>
                </SelectContent>
              </Select>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`flex justify-end transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <Button 
          onClick={saveSettings} 
          className="bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 group relative overflow-hidden"
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center">
                <Save className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Save Settings
              </span>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings; 