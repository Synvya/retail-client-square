
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Profile, defaultProfile } from '@/types/profile';
import { getMerchantProfile } from '@/services/api';

export const useProfileData = () => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    console.log('ProfileContext initialized');
    const token = localStorage.getItem('access_token');
    const merchantId = localStorage.getItem('merchant_id');
    const profilePublished = localStorage.getItem('profile_published') === 'true';
    const lastAuthTimestamp = localStorage.getItem('auth_timestamp');
    
    console.log('Checking for stored credentials');
    console.log('Access token exists:', !!token);
    console.log('Merchant ID exists:', !!merchantId);
    console.log('Profile published:', profilePublished);
    console.log('Last auth timestamp:', lastAuthTimestamp);
    
    // Check if tokens exist AND are not expired (using a 24-hour expiration for safety)
    const isTokenValid = token && merchantId && lastAuthTimestamp && 
      (Date.now() - parseInt(lastAuthTimestamp)) < 24 * 60 * 60 * 1000;
    
    if (isTokenValid) {
      console.log('Valid credentials found, fetching profile data');
      setIsAuthenticated(true);
      setIsLoading(true);
      fetchProfileData()
        .then(success => {
          if (success) {
            console.log('Successfully fetched profile data');
            setProfile(prev => ({
              ...prev,
              isConnected: true,
              profilePublished: profilePublished
            }));
          } else {
            console.error('Failed to fetch profile data');
            // On failure, clear tokens
            clearAuthData();
          }
        })
        .catch(err => {
          console.error('Error fetching profile data:', err);
          // If token is invalid, clear storage
          if (err.response?.status === 401) {
            console.log('Unauthorized access, clearing credentials');
            clearAuthData();
          }
          toast.error('Failed to load profile data');
        })
        .finally(() => setIsLoading(false));
    } else if (token || merchantId) {
      console.log('Found expired or invalid credentials, clearing');
      clearAuthData();
    } else {
      console.log('No credentials found');
      setIsAuthenticated(false);
    }
  }, []);

  // Function to clear authentication data
  const clearAuthData = () => {
    console.log('Clearing authentication data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('merchant_id');
    localStorage.removeItem('profile_published');
    localStorage.removeItem('auth_timestamp');
    setIsAuthenticated(false);
    setProfile(defaultProfile);
  };

  // Function to fetch profile data from the backend
  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data from backend');
      const merchantProfile = await getMerchantProfile();
      
      // Log the complete response for debugging
      console.log('Received profile data (complete):', JSON.stringify(merchantProfile, null, 2));
      
      // Check if we have a valid profile object
      if (!merchantProfile || typeof merchantProfile !== 'object') {
        console.error('Invalid profile data received:', merchantProfile);
        return false;
      }

      // Debug merchant profile structure
      console.log('Profile structure keys:', Object.keys(merchantProfile));
      
      // Determine public key with proper fallbacks
      let publicKey = '';
      if (merchantProfile.public_key) {
        publicKey = merchantProfile.public_key;
        console.log('Using public_key from API response:', publicKey);
      } else if (merchantProfile.nip05) {
        publicKey = typeof merchantProfile.nip05 === 'string' ? merchantProfile.nip05.split('@')[0] || '' : '';
        console.log('Falling back to nip05-derived public key:', publicKey);
      }

      // Convert backend format to our app format with null fallbacks for each field
      const updatedProfile = {
        name: merchantProfile.name || '',
        displayName: merchantProfile.display_name || '',
        about: merchantProfile.about || '',
        profilePicture: null,
        profilePictureUrl: merchantProfile.picture || null,
        bannerPicture: null,
        bannerPictureUrl: merchantProfile.banner || null,
        website: merchantProfile.website || '',
        categories: Array.isArray(merchantProfile.hashtags) ? merchantProfile.hashtags.join(', ') : '',
        businessType: merchantProfile.profile_type || 'retail',
        isConnected: true,
        publicKey: publicKey,
        profilePublished: localStorage.getItem('profile_published') === 'true',
      };
      
      console.log('Updated profile data:', JSON.stringify(updatedProfile, null, 2));
      setProfile(updatedProfile);

      return true;
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      return false;
    }
  };

  return {
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    fetchProfileData,
    clearAuthData,
    isAuthenticated
  };
};
