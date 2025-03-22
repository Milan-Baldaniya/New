import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, User, Mail, Lock, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  userType: z.enum(["consumer", "farmer"]),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  
  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "consumer",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        userType: data.userType
      });
      
      // Navigate to the appropriate dashboard
      navigate(`/${data.userType}/dashboard`);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-40 h-80 w-80 bg-farm-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-0 -right-40 h-80 w-80 bg-fresh-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
      <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-harvest-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
    
      <div className={`relative z-10 space-y-6 backdrop-blur-sm bg-white/95 p-8 rounded-xl shadow-2xl border border-white/50 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-farm-green-400 to-farm-green-600 rounded-full flex items-center justify-center mb-4 animate-morph">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-farm-green-600 to-fresh-blue-600 transition-all duration-500 delay-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Create an Account
          </h1>
          <p className={`text-gray-500 mt-2 transition-all duration-500 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Join our community of farmers and consumers
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={`space-y-2 transition-all duration-500 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Label htmlFor="name" className="flex items-center">
              <User className="h-4 w-4 mr-1 text-farm-green-500" />
              <span>Full Name</span>
            </Label>
            <div className="relative group">
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register("name")}
                className="transition-all border-gray-200 focus:border-farm-green-500 focus:ring-farm-green-500 pl-3 group-hover:border-gray-300"
              />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 group-hover:w-full transition-all duration-300 opacity-0 group-focus-within:opacity-100"></span>
            </div>
            {errors.name && (
              <p className="text-sm text-red-500 animate-shake">{errors.name.message}</p>
            )}
          </div>
          
          <div className={`space-y-2 transition-all duration-500 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1 text-farm-green-500" />
              <span>Email</span>
            </Label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register("email")}
                className="transition-all border-gray-200 focus:border-farm-green-500 focus:ring-farm-green-500 pl-3 group-hover:border-gray-300"
              />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 group-hover:w-full transition-all duration-300 opacity-0 group-focus-within:opacity-100"></span>
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 animate-shake">{errors.email.message}</p>
            )}
          </div>
          
          <div className={`space-y-2 transition-all duration-500 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Label htmlFor="password" className="flex items-center">
              <Lock className="h-4 w-4 mr-1 text-farm-green-500" />
              <span>Password</span>
            </Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="transition-all border-gray-200 focus:border-farm-green-500 focus:ring-farm-green-500 pl-3 group-hover:border-gray-300"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 hover:text-farm-green-500 transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 hover:text-farm-green-500 transition-colors" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-farm-green-400 to-farm-green-600 group-hover:w-full transition-all duration-300 opacity-0 group-focus-within:opacity-100"></span>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 animate-shake">{errors.password.message}</p>
            )}
          </div>
          
          <div className={`space-y-2 transition-all duration-500 delay-600 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Label className="flex items-center">
              <UserCheck className="h-4 w-4 mr-1 text-farm-green-500" />
              <span>I am a</span>
            </Label>
            <RadioGroup defaultValue="consumer" className="flex gap-4">
              <div className="flex items-center space-x-2 relative group">
                <RadioGroupItem
                  value="consumer"
                  id="user-consumer"
                  {...register("userType")}
                  className="text-farm-green-600 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                />
                <Label htmlFor="user-consumer" className="cursor-pointer group-hover:text-farm-green-700 transition-colors">Consumer</Label>
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-500 group-hover:w-full transition-all duration-300"></span>
              </div>
              <div className="flex items-center space-x-2 relative group">
                <RadioGroupItem
                  value="farmer"
                  id="user-farmer"
                  {...register("userType")}
                  className="text-farm-green-600 border-gray-300 focus:border-farm-green-500 focus:ring-farm-green-500"
                />
                <Label htmlFor="user-farmer" className="cursor-pointer group-hover:text-farm-green-700 transition-colors">Farmer</Label>
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-500 group-hover:w-full transition-all duration-300"></span>
              </div>
            </RadioGroup>
          </div>
          
          <div className={`space-y-2 transition-all duration-500 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={watch("terms")}
                onCheckedChange={(checked) => setValue("terms", checked === true)}
                className="mt-1 border-gray-300 text-farm-green-600 focus:ring-farm-green-500 transition-colors"
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-farm-green-600 hover:text-farm-green-800 transition-colors relative inline-block group">
                    Terms and Conditions
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-farm-green-600 hover:text-farm-green-800 transition-colors relative inline-block group">
                    Privacy Policy
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </Label>
                {errors.terms && (
                  <p className="text-sm text-red-500 animate-shake">{errors.terms.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className={`w-full bg-gradient-to-r from-farm-green-500 to-farm-green-600 hover:from-farm-green-600 hover:to-farm-green-700 transition-all duration-500 relative overflow-hidden group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '800ms' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              <>
                <span className="relative z-10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Create Account
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></span>
              </>
            )}
          </Button>
          
          <div className={`text-center transition-all duration-500 delay-900 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-farm-green-600 hover:text-farm-green-800 transition-colors relative inline-block group"
              >
                Sign in
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;