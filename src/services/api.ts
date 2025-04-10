
import axios from 'axios';

// Use the correct API URL
const API_BASE_URL = 'https://api.synvya.com';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Enable credentials
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Auth token attached to request');
    } else {
      console.log('No auth token available in localStorage');
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
      console.error('No response received');
    }
    return Promise.reject(error);
  }
);

// Simple backend connectivity check using just one endpoint
export const pingBackend = async () => {
  try {
    // Use the correct endpoint
    const response = await axios.get(`${API_BASE_URL}/health`, { 
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Backend connectivity check failed:', error);
    return false;
  }
};

// Update the Square OAuth endpoint with improved redirect handling
export const initiateSquareOAuth = async () => {
  try {
    // Get the current host from the URL
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    
    // Check if we're in the Lovable preview iframe
    const isLovablePreview = currentHost.includes('lovableproject.com') && 
                           window.location !== window.parent.location;
    
    console.log('OAuth initialization details:', {
      currentHost,
      protocol,
      isInIframe: window.location !== window.parent.location,
      isLovablePreview
    });
    
    // Generate the redirect URL based on environment
    let redirectUrl;
    if (isLovablePreview) {
      // If in preview, use the parent window's location to avoid iframe issues
      redirectUrl = `${protocol}//${currentHost}/auth/callback`;
      console.log('Using preview redirect URL:', redirectUrl);
    } else {
      // For standalone browser windows, use standard redirect
      redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Using standard redirect URL:', redirectUrl);
    }
    
    // Using the exact parameter name expected by the backend: redirect_uri
    const oauthUrl = `${API_BASE_URL}/square/oauth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);
    
    // Open in current window - this works better for OAuth flows
    window.location.href = oauthUrl;
    
    return true;
  } catch (error) {
    console.error('Error initiating Square OAuth:', error);
    throw error;
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
