
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { getMerchantProfile, updateMerchantProfile } from '../services/api';

// Define MerchantProfile interface based on the API response
interface MerchantProfile {
  name: string;
  display_name: string;
  about: string;
  picture: string | null;
  banner: string | null;
  website: string;
  hashtags: string[];
  profile_type: string;
  namespace: string;
  nip05: string;
  locations: string[];
}

interface Profile {
  name: string;
  displayName: string;
  about: string;
  profilePicture: File | null;
  profilePictureUrl: string | null;
  bannerPicture: File | null;
  bannerPictureUrl: string | null;
  website: string;
  categories: string;
  isConnected: boolean;
  publicKey: string;
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  connectWithSquare: () => Promise<boolean>;
  saveProfile: () => Promise<boolean>;
  resetProfile: () => void;
  isLoading: boolean;
}

const defaultProfile: Profile = {
  name: '',
  displayName: '',
  about: '',
  profilePicture: null,
  profilePictureUrl: null,
  bannerPicture: null,
  bannerPictureUrl: null,
  website: '',
  categories: '',
  isConnected: false,
  publicKey: '',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const merchantId = localStorage.getItem('merchant_id');
    
    if (token && merchantId) {
      setIsLoading(true);
      fetchProfileData()
        .catch(err => {
          console.error('Error fetching profile data:', err);
          // If token is invalid, clear storage
          if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('merchant_id');
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  // Function to fetch profile data from the backend
  const fetchProfileData = async () => {
    try {
      const merchantProfile = await getMerchantProfile();
      
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
        categories: merchantProfile.hashtags?.join(', ') || '',
        isConnected: true,
        publicKey: merchantProfile.nip05?.split('@')[0] || '',
      });
      
      return true;
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      toast.error('Failed to load profile data');
      return false;
    }
  };

  // Function to handle Square OAuth redirect
  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const merchantId = urlParams.get('merchant_id');
    const profilePublished = urlParams.get('profile_published');

    if (accessToken && merchantId) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('merchant_id', merchantId);
      
      // Show appropriate message based on profile_published
      if (profilePublished === 'true') {
        toast.success('Successfully connected with Square!');
      } else {
        toast.warning('Connected with Square, but profile publishing failed. You can retry in settings.');
      }
      
      return true;
    }
    
    return false;
  };

  // Initiate OAuth flow with Square
  const connectWithSquare = async (): Promise<boolean> => {
    try {
      // Check if we're on the callback route
      if (window.location.pathname.includes('/auth/callback')) {
        return handleOAuthCallback();
      }
      
      // Redirect to Square OAuth
      const callbackUrl = `${window.location.origin}/auth/callback`;
      window.location.href = `http://localhost:8000/square/oauth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
      return true; // This will actually not be returned as the page redirects
    } catch (error) {
      console.error('Error connecting with Square:', error);
      toast.error('An error occurred while connecting with Square.');
      return false;
    }
  };

  // Save profile to backend
  const saveProfile = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Convert our app format to backend format
      const merchantProfile: Partial<MerchantProfile> = {
        name: profile.name,
        display_name: profile.displayName,
        about: profile.about,
        website: profile.website,
        hashtags: profile.categories.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      
      // Add images if they've been changed
      if (profile.profilePicture) {
        // This is a simplification - in a real app you'd upload the file to a server
        // and then use the returned URL in the profile update
        // merchantProfile.picture = await uploadImage(profile.profilePicture);
        toast.warning('Image uploads not implemented in this demo');
      }
      
      if (profile.bannerPicture) {
        // Similar to above
        // merchantProfile.banner = await uploadImage(profile.bannerPicture);
        toast.warning('Image uploads not implemented in this demo');
      }
      
      // Send update to backend
      await updateMerchantProfile(merchantProfile);
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updatedProfile: Partial<Profile>) => {
    setProfile({ ...profile, ...updatedProfile });
  };

  const resetProfile = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('merchant_id');
    setProfile(defaultProfile);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        connectWithSquare,
        saveProfile,
        resetProfile,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
