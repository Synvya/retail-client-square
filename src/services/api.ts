
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Square OAuth endpoints
export const initiateSquareOAuth = (redirectUri?: string) => {
  const callbackUrl = redirectUri || `${window.location.origin}/auth/callback`;
  console.log(`Initiating OAuth with callback URL: ${callbackUrl}`);
  const url = `${API_BASE_URL}/square/oauth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  console.log(`Redirecting to: ${url}`);
  window.location.href = url;
};

// Merchant profile APIs
export const getMerchantProfile = async () => {
  console.log('Fetching merchant profile');
  const response = await api.get('/square/profile');
  console.log('Profile response:', response.data);
  return response.data;
};

export const updateMerchantProfile = async (profileData: any) => {
  console.log('Updating merchant profile with data:', profileData);
  const response = await api.post('/square/profile/publish', profileData);
  console.log('Update response:', response.data);
  return response.data;
};

// Merchant info APIs
export const getMerchantInfo = async () => {
  console.log('Fetching merchant info');
  const response = await api.get('/square/seller/info');
  console.log('Merchant info response:', response.data);
  return response.data;
};

export default api;
