
import axios from 'axios';

// Use environment-specific API URL
// For development environment, use localhost
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://retail-backend.synvya.com' 
  : 'http://localhost:3000';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    // Only check the root endpoint with minimal headers
    const response = await api.get('/', {
      timeout: 5000,
      // Prevent caching of status checks
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    console.log('Ping response:', response.status);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Backend connectivity check failed:', error);
    return false;
  }
};

export default api;
