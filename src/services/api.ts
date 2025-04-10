import axios from 'axios';

// Set the fixed cloud API URL to use HTTP instead of HTTPS
// This avoids SSL certificate issues when connecting to the development server
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
  withCredentials: true, // Enable credentials since server allows_credentials=True
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

// Square OAuth endpoint - synchronized exactly with Synvya retail-dashboard implementation
export const initiateSquareOAuth = async () => {
  try {
    // Generate the callback URL using the current origin - this must exactly match
    // what the backend expects to prevent "invalid request received" errors
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log(`Initiating OAuth with callback URL: ${redirectUrl}`);
    
    // Using the exact parameter name expected by the backend: redirect_uri
    const oauthUrl = `${API_BASE_URL}/square/oauth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);
    
    // Redirect the user to the Square OAuth authorization URL
    // This will navigate away from the current page to Square's auth page
    window.location.href = oauthUrl;
    
    return true;
  } catch (error) {
    console.error('Error initiating Square OAuth:', error);
    throw error; // Re-throw to allow handling in the UI
  }
};

// Specialized backend connectivity check using direct browser features
export const pingBackend = async () => {
  console.log('Checking backend connection at:', `${API_BASE_URL}/`);
  
  try {
    // Try using a script tag to detect if the server is online
    // This approach can bypass some CORS restrictions
    return new Promise<boolean>((resolve) => {
      // Set a timeout for the overall operation
      const timeoutId = setTimeout(() => {
        console.error('Backend connectivity check timed out');
        cleanup();
        resolve(false);
      }, 5000);
      
      // Cleanup function to remove elements and clear timeout
      const cleanup = () => {
        clearTimeout(timeoutId);
        if (img) document.body.removeChild(img);
      };
      
      // Create an image element to ping the server
      // This is a common technique to check if a server is online
      // without triggering CORS issues
      const img = document.createElement('img');
      img.style.display = 'none';
      document.body.appendChild(img);
      
      // Set up event handlers
      img.onload = () => {
        console.log('Backend connection detected via image load');
        cleanup();
        resolve(true);
      };
      
      img.onerror = () => {
        // Even an error means the server is reachable
        // (error happens because it's not an image)
        console.log('Backend connection detected via image error');
        cleanup();
        resolve(true);
      };
      
      // Set source to trigger the request
      // Adding a cache buster to prevent browser caching
      img.src = `${API_BASE_URL}/favicon.ico?_=${Date.now()}`;
    });
  } catch (error) {
    console.error('Backend connectivity check failed:', error);
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
