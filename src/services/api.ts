import axios from 'axios';

// Update the API URL to use the domain and HTTPS
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

// Update the Square OAuth endpoint to match the new URL
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

// Update backend connectivity check for the new domain
export const pingBackend = async () => {
  console.log('Checking backend connection at:', `${API_BASE_URL}/`);
  
  try {
    // Use a more direct method since we're using a proper domain now
    const response = await fetch(`${API_BASE_URL}/square/health`, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (response.ok) {
      console.log('Backend connection successful via fetch');
      return true;
    } else {
      console.log('Backend connection failed via fetch');
      return false;
    }
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
