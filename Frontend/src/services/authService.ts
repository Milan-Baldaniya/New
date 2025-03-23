import { api } from './api';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  userType: "consumer" | "farmer" | "admin";
  profileImage?: string;
}

// Registration data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: "consumer" | "farmer";
}

// OTP related interfaces
export interface RequestOtpResponse {
  success: boolean;
  message: string;
  otpId?: string;
}

export interface VerifyOtpData {
  email: string;
  otpCode: string;
  otpId: string;
}

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const OTP_ID_KEY = 'otp_id';

// Get token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Save token to local storage
const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Save OTP ID to local storage
const saveOtpId = (otpId: string): void => {
  localStorage.setItem(OTP_ID_KEY, otpId);
};

// Get OTP ID from local storage
const getOtpId = (): string | null => {
  return localStorage.getItem(OTP_ID_KEY);
};

// Remove OTP ID from local storage
const removeOtpId = (): void => {
  localStorage.removeItem(OTP_ID_KEY);
};

// Save user data to local storage
const saveUser = (user: User): void => {
  console.log('Saving user to localStorage:', user);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data from local storage
const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  removeOtpId();
};

// Auth service with real API integration
export const authService = {
  // Request OTP for login
  requestLoginOtp: async (email: string): Promise<RequestOtpResponse> => {
    try {
      // In a real implementation, this would call your backend API
      // to generate an OTP and send it to the user's email
      const response = await api.post('/auth/request-otp', { email });
      
      if (response.success && response.otpId) {
        // Save OTP ID for later verification
        saveOtpId(response.otpId);
        return {
          success: true,
          message: "OTP sent to your email",
          otpId: response.otpId
        };
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // For demo/development purposes, simulate successful OTP request with mock data
      const mockOtpId = `otp_${Date.now()}`;
      saveOtpId(mockOtpId);
      
      return {
        success: true,
        message: "MOCK OTP: 123456 (Development Only)",
        otpId: mockOtpId
      };
    }
  },
  
  // Verify OTP and login
  verifyOtpAndLogin: async (email: string, otpCode: string): Promise<User> => {
    try {
      // Get stored OTP ID
      const otpId = getOtpId();
      
      if (!otpId) {
        throw new Error('OTP session expired. Please request a new OTP.');
      }
      
      // In a real implementation, this would call your backend API
      // to verify the OTP and authenticate the user
      const response = await api.post('/auth/verify-otp', {
        email,
        otpCode,
        otpId
      });
      
      if (response.success && response.token && response.user) {
        // Save token and user data
        saveToken(response.token);
        
        // Transform backend user to frontend User format
        const user: User = {
          id: response.user.id || response.user._id,
          name: response.user.name,
          email: response.user.email,
          userType: response.user.userType,
          profileImage: response.user.profileImage || ''
        };
        
        saveUser(user);
        removeOtpId(); // Clear the OTP ID after successful verification
        return user;
      } else {
        throw new Error('Invalid OTP or verification failed');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // For demo/development purposes, simulate successful verification with mock data
      // when OTP is "123456"
      if (otpCode === "123456") {
        // Mock user data
        const mockUser: User = {
          id: `user_${Date.now()}`,
          name: "Demo User",
          email: email,
          userType: "consumer"
        };
        
        // Save mock user data
        saveUser(mockUser);
        removeOtpId();
        
        return mockUser;
      } else {
        throw new Error('Invalid OTP code');
      }
    }
  },

  // Login user (traditional password-based login, kept for backward compatibility)
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.token && response.user) {
        // Save token and user data
        saveToken(response.token);
        
        // Transform backend user to frontend User format
        const user: User = {
          id: response.user.id || response.user._id,
          name: response.user.name,
          email: response.user.email,
          userType: response.user.userType,
          profileImage: response.user.profileImage || ''
        };
        
        saveUser(user);
        return user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Register new user
  register: async (userData: RegisterData): Promise<User> => {
    try {
      console.log('Sending registration data:', userData);
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response);
      
      if (response.success && response.token && response.user) {
        // Save token and user data
        saveToken(response.token);
        
        // Transform backend user to frontend User format
        const user: User = {
          id: response.user.id || response.user._id,
          name: response.user.name,
          email: response.user.email,
          userType: response.user.userType,
          profileImage: response.user.profileImage || ''
        };
        
        console.log('Transformed user object:', user);
        
        saveUser(user);
        return user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    // Clear auth data from local storage
    clearAuthData();
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Check for token first
      const token = getToken();
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      
      // Try to get user data from localStorage first
      const userString = localStorage.getItem(USER_KEY);
      console.log('User data from localStorage:', userString);
      
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          console.log('Parsed user data:', userData);
          return userData;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // If not in localStorage, fetch from API
      console.log('Fetching user data from API');
      const response = await api.get('/auth/me', true);
      console.log('API response for user data:', response);
      
      if (response.success && response.data) {
        // Transform backend user to frontend User format
        const user: User = {
          id: response.data.id || response.data._id,
          name: response.data.name,
          email: response.data.email,
          userType: response.data.userType,
          profileImage: response.data.profileImage || ''
        };
        
        console.log('Transformed user from API:', user);
        saveUser(user);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Reset password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  }
};
