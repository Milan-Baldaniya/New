// Base API configuration for the application
import { getToken } from './authService';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// HTTP request methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Helper function to build request options
const createRequestOptions = (method: HttpMethod, data?: any, requiresAuth = false): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Add authorization header if required
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  return options;
};

// Function to handle API responses consistently
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let data;
  
  // Check if response is JSON
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // Handle non-JSON responses
    const text = await response.text();
    try {
      // Try to parse it anyway
      data = JSON.parse(text);
    } catch (e) {
      // If parsing fails, create an error object with the text
      data = {
        success: false,
        error: `Non-JSON response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
      };
    }
  }
  
  if (!response.ok) {
    // Extract error message from the API response
    const errorMessage = data.error || data.message || 'An unexpected error occurred';
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      url: response.url
    });
    throw new Error(errorMessage);
  }
  
  return data;
};

// API fetch wrapper
export const api = {
  // GET request
  get: async (endpoint: string, requiresAuth = false) => {
    const options = createRequestOptions('GET', undefined, requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  },
  
  // POST request
  post: async (endpoint: string, data: any, requiresAuth = false) => {
    const options = createRequestOptions('POST', data, requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  },
  
  // PUT request
  put: async (endpoint: string, data: any, requiresAuth = false) => {
    const options = createRequestOptions('PUT', data, requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  },
  
  // DELETE request
  delete: async (endpoint: string, requiresAuth = false) => {
    const options = createRequestOptions('DELETE', undefined, requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  }
}; 