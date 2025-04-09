import axios from 'axios';

// IMPORTANT: Update this to your actual backend URL if not running locally
const API_BASE_URL = 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Modified pingBackend function to use the root endpoint
export const pingBackend = async () => {
  try {
    console.log('Checking backend connection at:', `${API_BASE_URL}/`);
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('Backend connection response status:', response.status);
    
    if (response.ok) {
      console.log('Backend is online');
      return true;
    } else {
      console.error('Backend returned error status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Backend connection failed:', error);
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
