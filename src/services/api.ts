
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
  const url = `${API_BASE_URL}/square/oauth${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`;
  window.location.href = url;
};

// Merchant profile APIs
export const getMerchantProfile = async () => {
  const response = await api.get('/square/profile');
  return response.data;
};

export const updateMerchantProfile = async (profileData: any) => {
  const response = await api.post('/square/profile/publish', profileData);
  return response.data;
};

// Merchant info APIs
export const getMerchantInfo = async () => {
  const response = await api.get('/square/seller/info');
  return response.data;
};

export default api;
