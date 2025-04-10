
import axios from 'axios';

// Set the fixed cloud API URL to use HTTP only
const API_BASE_URL = 'http://54.227.98.115:8000';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  // Enable CORS credentials if the API requires them
  withCredentials: false,
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Auth token attached to request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better debugging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API error response:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers
      });
    }
    return Promise.reject(error);
  }
);

// Square OAuth endpoints 
export const initiateSquareOAuth = async (redirectUri?: string) => {
  try {
    // Use the explicitly provided callback URL or build one from the current origin
    const callbackUrl = redirectUri || `${window.location.origin}/auth/callback`;
    console.log(`Initiating OAuth with callback URL: ${callbackUrl}`);
    
    // Instead of using the API instance, construct a direct URL for redirection
    // This avoids CORS issues since it's a direct browser navigation, not an AJAX request
    const oauthUrl = `${API_BASE_URL}/square/oauth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);
    
    // Open the OAuth URL in the same window
    window.location.href = oauthUrl;
    
    // Return true to indicate that redirection has been initiated
    return true;
  } catch (error) {
    console.error('Error initiating Square OAuth:', error);
    return false;
  }
};

// Simple backend connectivity check
export const pingBackend = async () => {
  console.log('Checking backend connection at:', `${API_BASE_URL}/`);
  
  try {
    // Try a simple fetch request first to avoid CORS preflight
    console.log('Attempting fetch request...');
    try {
      const fetchResponse = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      console.log('Fetch response:', fetchResponse.status);
      return fetchResponse.ok;
    } catch (fetchError) {
      console.log('Fetch attempt failed, falling back to axios:', fetchError);
      // Fall back to axios if fetch fails
    }
    
    // Axios request as fallback
    const response = await api.get('/', { 
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('Backend connection successful:', response.status);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Backend connection failed:', error);
    // Log more detailed diagnostic information
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error details:', {
        message: 'This typically indicates a CORS issue, server unreachable, or blocked by browser security',
        browserInfo: navigator.userAgent,
        errorCode: error.code
      });
    }
    return false;
  }
};

// Merchant profile APIs
export const getMerchantProfile = async () => {
  try {
    console.log('Fetching merchant profile from:', `${API_BASE_URL}/square/profile`);
    const response = await api.get('/square/profile');
    console.log('Profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    throw error;
  }
};

export const updateMerchantProfile = async (profileData: any) => {
  try {
    console.log('Updating merchant profile with data:', profileData);
    console.log('Request URL:', `${API_BASE_URL}/square/profile/publish`);
    const response = await api.post('/square/profile/publish', profileData);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating merchant profile:', error);
    throw error;
  }
};

// Merchant info APIs
export const getMerchantInfo = async () => {
  try {
    console.log('Fetching merchant info from:', `${API_BASE_URL}/square/seller/info`);
    const response = await api.get('/square/seller/info');
    console.log('Merchant info response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching merchant info:', error);
    throw error;
  }
};

export default api;
