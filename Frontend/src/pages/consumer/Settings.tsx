import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, Moon, Sun, Globe, Shield, Phone, Mail, Lock, Loader2, Save, 
  AlertTriangle, Check, Smartphone, LogOut, Trash2
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/context/ThemeContext';

const ConsumerSettings = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      orders: true,
      security: true,
    },
    language: 'english',
    currency: 'inr',
    privacy: {
      showProfile: 'everyone',
      shareData: false,
      cookiePreference: 'essential',
    }
  });
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    // Set dark mode based on theme context
    setSettings(prev => ({
      ...prev,
      darkMode: theme === 'dark'
    }));
  }, [theme]);

  const handleToggle = (section: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as object,
        [key]: !(prev[section as keyof typeof prev] as any)[key]
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleThemeToggle = () => {
    const newDarkMode = !settings.darkMode;
    setSettings(prev => ({
      ...prev,
      darkMode: newDarkMode
    }));
    setTheme(newDarkMode ? 'dark' : 'light');
  };

  const handleSaveSettings = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  const handleDeleteAccount = () => {
    // Handle account deletion logic
    console.log('Account deletion requested');
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold relative inline-block">
          Account Settings
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 transform scale-x-0 transition-transform duration-700 origin-left" 
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
        </h2>
        <p className="text-gray-600 mt-2">Customize your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme & Appearance */}
        <Card className={`transition-all duration-300 delay-100 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              {settings.darkMode ? 
                <Moon className="h-5 w-5 mr-2 text-farm-green-600" /> : 
                <Sun className="h-5 w-5 mr-2 text-farm-green-600" />
              }
              Theme & Appearance
            </CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="transition-transform duration-500 transform-gpu" style={{ 
                  transform: settings.darkMode ? 'rotate(360deg)' : 'rotate(0deg)' 
                }}>
                  {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode} 
                onCheckedChange={handleThemeToggle}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                defaultValue={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger id="language" className="transition-all duration-300 hover:border-farm-green-500">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="kannada">Kannada</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                defaultValue={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="currency" className="transition-all duration-300 hover:border-farm-green-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                  <SelectItem value="eur">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className={`transition-all duration-300 delay-200 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <Bell className="h-5 w-5 mr-2 text-farm-green-600" />
              Notifications
            </CardTitle>
            <CardDescription>Configure what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <Label htmlFor="email-notif">Email Notifications</Label>
              </div>
              <Switch 
                id="email-notif" 
                checked={settings.notifications.email} 
                onCheckedChange={() => handleToggle('notifications', 'email')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <Label htmlFor="sms-notif">SMS Notifications</Label>
              </div>
              <Switch 
                id="sms-notif" 
                checked={settings.notifications.sms} 
                onCheckedChange={() => handleToggle('notifications', 'sms')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <Label htmlFor="push-notif">Push Notifications</Label>
              </div>
              <Switch 
                id="push-notif" 
                checked={settings.notifications.push} 
                onCheckedChange={() => handleToggle('notifications', 'push')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-notif" className="flex-1">Marketing emails and promotions</Label>
              <Switch 
                id="marketing-notif" 
                checked={settings.notifications.marketing} 
                onCheckedChange={() => handleToggle('notifications', 'marketing')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="orders-notif" className="flex-1">Order status updates</Label>
              <Switch 
                id="orders-notif" 
                checked={settings.notifications.orders} 
                onCheckedChange={() => handleToggle('notifications', 'orders')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="security-notif" className="flex-1">Security alerts</Label>
              <Switch 
                id="security-notif" 
                checked={settings.notifications.security} 
                onCheckedChange={() => handleToggle('notifications', 'security')}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className={`transition-all duration-300 delay-300 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <Shield className="h-5 w-5 mr-2 text-farm-green-600" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy settings and access</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Who can see your profile</Label>
              <RadioGroup 
                defaultValue={settings.privacy.showProfile}
                onValueChange={(value) => handlePrivacyChange('showProfile', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded transition-colors duration-200 hover:bg-farm-green-50">
                  <RadioGroupItem value="everyone" id="everyone" className="border-farm-green-600 text-farm-green-600" />
                  <Label htmlFor="everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded transition-colors duration-200 hover:bg-farm-green-50">
                  <RadioGroupItem value="followers" id="followers" className="border-farm-green-600 text-farm-green-600" />
                  <Label htmlFor="followers">Only farmers I follow</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded transition-colors duration-200 hover:bg-farm-green-50">
                  <RadioGroupItem value="nobody" id="nobody" className="border-farm-green-600 text-farm-green-600" />
                  <Label htmlFor="nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sharing" className="flex-1">Share usage data to improve services</Label>
              <Switch 
                id="data-sharing" 
                checked={settings.privacy.shareData} 
                onCheckedChange={(checked) => handlePrivacyChange('shareData', checked)}
                className="transition-all duration-300 data-[state=checked]:bg-farm-green-600"
              />
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="cookies">Cookie Preferences</Label>
              <RadioGroup 
                defaultValue={settings.privacy.cookiePreference}
                onValueChange={(value) => handlePrivacyChange('cookiePreference', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded transition-colors duration-200 hover:bg-farm-green-50">
                  <RadioGroupItem value="all" id="all-cookies" className="border-farm-green-600 text-farm-green-600" />
                  <Label htmlFor="all-cookies">Accept all cookies</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded transition-colors duration-200 hover:bg-farm-green-50">
                  <RadioGroupItem value="essential" id="essential-cookies" className="border-farm-green-600 text-farm-green-600" />
                  <Label htmlFor="essential-cookies">Essential cookies only</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className={`transition-all duration-300 delay-400 transform hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-farm-green-700">
              <Lock className="h-5 w-5 mr-2 text-farm-green-600" />
              Account Management
            </CardTitle>
            <CardDescription>Manage your account settings and data</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Button
                variant="outline" 
                className="w-full justify-center relative overflow-hidden border-farm-green-600 text-farm-green-700 hover:text-farm-green-800 hover:bg-farm-green-50 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 w-3 bg-farm-green-600 bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div>
              <Button 
                variant="outline" 
                className="w-full justify-center border-orange-600 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-all duration-300"
              >
                <Globe className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
            </div>

            <Separator className="my-2" />

            <div>
              <Button 
                variant="outline" 
                className="w-full justify-center border-red-600 text-red-700 hover:bg-red-50 hover:text-red-800 transition-all duration-300"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`flex justify-end transition-all duration-300 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Button 
          className="group relative overflow-hidden bg-farm-green-600 hover:bg-farm-green-700 transform hover:scale-105 transition-all duration-300"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <div className="absolute inset-0 w-3 bg-white bg-opacity-30 skew-x-[45deg] group-hover:animate-shine hidden md:block" />
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

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

export default ConsumerSettings; 