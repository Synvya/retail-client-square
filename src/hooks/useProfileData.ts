import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Profile, defaultProfile } from '@/types/profile';
import { getMerchantProfile } from '@/services/api';

export const useProfileData = () => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    console.log('ProfileContext initialized');
    const token = localStorage.getItem('access_token');
    const merchantId = localStorage.getItem('merchant_id');
    const profilePublished = localStorage.getItem('profile_published') === 'true';

    console.log('Checking for stored credentials');
    console.log('Access token exists:', !!token);
    console.log('Merchant ID exists:', !!merchantId);
    console.log('Profile published:', profilePublished);

    if (token && merchantId) {
      console.log('Credentials found, fetching profile data');
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('merchant_id');
            localStorage.removeItem('profile_published');
          }
        })
        .catch(err => {
          console.error('Error fetching profile data:', err);
          // If token is invalid, clear storage
          if (err.response?.status === 401) {
            console.log('Unauthorized access, clearing credentials');
            localStorage.removeItem('access_token');
            localStorage.removeItem('merchant_id');
            localStorage.removeItem('profile_published');
          }
          toast.error('Failed to load profile data');
        })
        .finally(() => setIsLoading(false));
    } else {
      console.log('No credentials found');
    }
  }, []);

  // Function to fetch profile data from the backend
  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data from backend');
      const merchantProfile = await getMerchantProfile();
      console.log('Received profile data:', merchantProfile);

      // Determine public key, with fallbacks
      let publicKey = '';
      if (merchantProfile.public_key) {
        // First try to use the dedicated public_key field
        publicKey = merchantProfile.public_key;
        console.log('Using public_key from API response:', publicKey);
      } else if (merchantProfile.nip05) {
        // Fall back to parsing from nip05 if available
        publicKey = typeof merchantProfile.nip05 === 'string' ? merchantProfile.nip05.split('@')[0] || '' : '';
        console.log('Falling back to nip05-derived public key:', publicKey);
      }

      // Convert backend format to our app format
      setProfile({
        name: merchantProfile.name || '',
        displayName: merchantProfile.display_name || '',
        about: merchantProfile.about || '',
        profilePicture: null,
        profilePictureUrl: merchantProfile.picture || null,
        bannerPicture: null,
        bannerPictureUrl: merchantProfile.banner || null,
        website: merchantProfile.website || '',
        categories: Array.isArray(merchantProfile.hashtags) ? merchantProfile.hashtags.join(', ') : '',
        isConnected: true,
        publicKey: publicKey,
        profilePublished: localStorage.getItem('profile_published') === 'true',
      });

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
    fetchProfileData
  };
};
