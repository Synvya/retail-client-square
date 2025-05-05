import axios from 'axios';

// Always use the production API URL
const API_BASE_URL = 'https://retail-backend.synvya.com';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment is PROD:', import.meta.env.PROD);
console.log('Current hostname:', window.location.hostname);
console.log('Current origin:', window.location.origin);
console.log('Full URL:', window.location.href);
console.log('Is Lovable environment:', window.location.href.includes('lovable.dev'));

// Detect Lovable environment
const isLovableEnvironment = window.location.href.includes('lovable.dev');
if (isLovableEnvironment) {
  console.log('IMPORTANT: Detected Lovable development environment');
  console.log('CORS NOTE: Add this origin to your backend CORS allowed origins:');
  console.log(window.location.origin);
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Origin': window.location.origin, // Add origin header for debugging
  },
  timeout: 60000, // 60 second timeout
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
      
      // Improved CORS error detection
      if (error.response.status === 0 || 
          (error.message && error.message.includes('Network Error')) ||
          (error.response.status === 403 && error.response.headers['access-control-allow-origin'] === undefined)) {
        console.error('This appears to be a CORS issue.');
        console.error('CORS ISSUE: Add this origin to your backend CORS allowed origins:');
        console.error(window.location.origin);
        console.error('Full project URL:', window.location.href);
      }
    } else if (error.request) {
      console.error('No response received');
    }
    return Promise.reject(error);
  }
);

// Simple backend connectivity check using only the root endpoint
export const pingBackend = async () => {
  try {
    console.log('Pinging backend at:', API_BASE_URL);
    console.log('Current time:', new Date().toISOString());
    console.log('Request origin:', window.location.origin);
    // Only check the root endpoint with minimal headers
    const response = await api.get('/', {
      timeout: 5000,
      // Prevent caching of status checks
      headers: {
        'Cache-Control': 'no-cache',
        'X-Request-Origin': window.location.origin // Additional debugging header
      }
    });
    console.log('Ping response:', response.status);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Backend connectivity check failed:', error);
    console.error('Error details:', error);
    // Check if it's a CORS issue
    if (error.message && error.message.includes('Network Error')) {
      console.error('This appears to be a network or CORS issue.');
      console.error('IMPORTANT - Add this origin to your CORS configuration:');
      console.error(window.location.origin);
      
      if (API_BASE_URL.includes('https') && window.location.protocol === 'http:') {
        console.error('Mixed content issue detected: HTTPS API being called from HTTP origin');
      }
    }
    // Check for timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out - backend may be slow or unavailable');
    }
    return false;
  }
};

export default api;
