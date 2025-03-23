import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "consumer" | "farmer" | "admin";
  profileImage?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (email: string, otpCode: string) => Promise<void>;
  requestOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: "consumer" | "farmer";
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on component mount
    const checkAuthStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      return newUser;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was an error during registration. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error during logout.",
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "There was an error sending the password reset email.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Request OTP for login
  const requestOtp = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authService.requestLoginOtp(email);
      
      toast({
        title: "OTP Sent",
        description: response.message,
      });
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: "There was an error sending the OTP. Please try again.",
        variant: "destructive",
      });
      return {
        success: false,
        message: "Failed to send OTP"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with OTP
  const loginWithOtp = async (email: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const userData = await authService.verifyOtpAndLogin(email, otpCode);
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithOtp,
    requestOtp,
    logout,
    register,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
