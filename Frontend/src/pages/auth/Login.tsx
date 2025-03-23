import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn, User, ShieldCheck, Mail, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  
  const { login, requestOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from the location state, or default to dashboard
  const from = location.state?.from?.pathname || "/";
  
  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      
      // Navigate to the from location or appropriate dashboard
      navigate(from);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await requestOtp(email);
      if (response.success) {
        setOtpSent(true);
        setOtpMessage(response.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error("OTP request error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !otpCode) {
      setError("Please enter your email and OTP code.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await loginWithOtp(email, otpCode);
      
      // Navigate to the from location or appropriate dashboard
      navigate(from);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      console.error("OTP login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Quick login buttons for demo purposes
  const loginAsFarmer = async () => {
    setEmail("mary@example.com");
    setPassword("password");
    
    try {
      setIsSubmitting(true);
      await login("mary@example.com", "password");
      navigate("/farmer/dashboard");
    } catch (err) {
      setError("Demo login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const loginAsConsumer = async () => {
    setEmail("john@example.com");
    setPassword("password");
    
    try {
      setIsSubmitting(true);
      await login("john@example.com", "password");
      navigate("/consumer/dashboard");
    } catch (err) {
      setError("Demo login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Animated background circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-farm-green-100 rounded-full opacity-30 animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-fresh-blue-100 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <Card className={`w-full max-w-md mx-auto transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} relative backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl`}>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-farm-green-400 to-farm-green-600 rounded-full flex items-center justify-center animate-pulse-subtle">
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <CardHeader className="pt-12">
          <CardTitle className={`text-2xl text-center transition-all duration-500 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Login to FarmChain
          </CardTitle>
          <CardDescription className={`text-center transition-all duration-500 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="password" className="w-full" onValueChange={(value) => setLoginMethod(value as "password" | "otp")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">OTP Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className={`space-y-2 transition-all duration-500 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all pl-10 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-farm-green-500 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <div className={`space-y-2 transition-all duration-500 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-farm-green-600 hover:underline hover:text-farm-green-700 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all pl-10 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-farm-green-500 transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300 overflow-hidden relative group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '500ms' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center">
                        <LogIn className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                        Login
                      </span>
                      <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="otp">
              <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-otp">Email</Label>
                  <div className="relative group">
                    <Input
                      id="email-otp"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={otpSent && isSubmitting}
                      className="transition-all pl-10 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-farm-green-500 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                {otpSent && (
                  <>
                    {otpMessage && (
                      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                        <AlertDescription>{otpMessage}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <div className="relative group">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter OTP code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          className="transition-all pl-10 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-farm-green-500 transition-colors">
                          <Key className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <Button 
                  type={otpSent ? "submit" : "button"} 
                  onClick={otpSent ? undefined : handleSendOtp}
                  className="w-full bg-farm-green-600 hover:bg-farm-green-700 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {otpSent ? "Verifying..." : "Sending OTP..."}
                    </span>
                  ) : (
                    <>
                      {otpSent ? "Login with OTP" : "Send OTP"}
                    </>
                  )}
                </Button>
                
                {otpSent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setOtpMessage("");
                    }}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Resend OTP
                  </Button>
                )}
              </form>
            </TabsContent>
          </Tabs>
          
          <div className={`mt-6 transition-all duration-500 delay-600 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-center text-sm mb-4 relative">
              <span className="bg-white/80 px-2 relative z-10">Demo Login Options</span>
              <span className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={loginAsConsumer}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group relative overflow-hidden"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 group-hover:text-farm-green-600 transition-colors animate-pulse-subtle" />
                <span>Consumer Demo</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green-500 group-hover:w-full transition-all duration-300"></span>
              </Button>
              <Button
                variant="outline"
                onClick={loginAsFarmer}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group relative overflow-hidden"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 group-hover:text-farm-green-600 transition-colors animate-pulse-subtle" />
                <span>Farmer Demo</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green-500 group-hover:w-full transition-all duration-300"></span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={`flex justify-center transition-all duration-500 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-farm-green-600 hover:text-farm-green-800 transition-colors relative group">
              Register
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
