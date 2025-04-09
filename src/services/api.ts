
import axios from 'axios';

// Get the API URL from a global variable if available, or use the default
// To override this in development, you can set window.API_BASE_URL before the app loads
// For production, deploy the backend to a public URL
const API_BASE_URL = (window as any).API_BASE_URL || 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add longer timeout for potentially slow ngrok connections
  timeout: 15000, // Increased timeout for slower connections
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
      console.error('No response received. Request:', error.request);
    }
    return Promise.reject(error);
  }
);

// Square OAuth endpoints
export const initiateSquareOAuth = async (redirectUri?: string) => {
  try {
    const callbackUrl = redirectUri || `${window.location.origin}/auth/callback`;
    console.log(`Initiating OAuth with callback URL: ${callbackUrl}`);
    
    // Instead of making an API call to /ping, use the root endpoint
    const response = await api.get('/');
    console.log('Backend connection successful:', response.data);
    
    // Create an anchor element and trigger a click
    const oauthUrl = `${API_BASE_URL}/square/oauth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);
    
    // Use window.location.href for reliable redirection
    window.location.href = oauthUrl;
    return true;
  } catch (error) {
    console.error('Error initiating Square OAuth:', error);
    return false;
  }
};

// Completely rewritten pingBackend function with multiple fallback methods
export const pingBackend = async () => {
  console.log('Checking backend connection at:', `${API_BASE_URL}/`);
  
  // Try multiple methods to connect to the backend
  const methods = [
    // Method 1: Use fetch with CORS mode
    async () => {
      try {
        console.log('Trying fetch with CORS mode...');
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'include',
          signal: AbortSignal.timeout(5000),
        });
        
        console.log('Fetch response status:', response.status);
        return response.ok;
      } catch (error) {
        console.log('Fetch method failed:', error);
        return false;
      }
    },
    
    // Method 2: Use axios with our configured instance
    async () => {
      try {
        console.log('Trying axios...');
        const response = await api.get('/', { timeout: 5000 });
        console.log('Axios response status:', response.status);
        return response.status >= 200 && response.status < 300;
      } catch (error) {
        console.log('Axios method failed:', error);
        return false;
      }
    },
    
    // Method 3: Try a HEAD request which might be lighter
    async () => {
      try {
        console.log('Trying HEAD request...');
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'HEAD',
          mode: 'no-cors', // Try with no-cors as a last resort
          signal: AbortSignal.timeout(5000),
        });
        
        console.log('HEAD response type:', response.type);
        // With no-cors, we can't read the status so we check if we got any response
        return response.type === 'opaque' || response.ok;
      } catch (error) {
        console.log('HEAD method failed:', error);
        return false;
      }
    }
  ];
  
  // Try each method until one succeeds
  for (const method of methods) {
    const result = await method();
    if (result) {
      console.log('Backend is online');
      return true;
    }
  }
  
  console.error('All backend connection methods failed');
  return false;
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
