
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
    console.log('ProfileContext initialized');
    const token = localStorage.getItem('access_token');
    const merchantId = localStorage.getItem('merchant_id');
    
    console.log('Checking for stored credentials');
    console.log('Access token exists:', !!token);
    console.log('Merchant ID exists:', !!merchantId);
    
    if (token && merchantId) {
      console.log('Credentials found, fetching profile data');
      setIsLoading(true);
      fetchProfileData()
        .then(success => {
          if (success) {
            console.log('Successfully fetched profile data');
          } else {
            console.error('Failed to fetch profile data');
          }
        })
        .catch(err => {
          console.error('Error fetching profile data:', err);
          // If token is invalid, clear storage
          if (err.response?.status === 401) {
            console.log('Unauthorized access, clearing credentials');
            localStorage.removeItem('access_token');
            localStorage.removeItem('merchant_id');
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
      return false;
    }
  };

  // Function to handle Square OAuth callback
  const handleOAuthCallback = () => {
    console.log('Processing OAuth callback');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const merchantId = urlParams.get('merchant_id');
    const profilePublished = urlParams.get('profile_published');

    console.log('Received parameters:');
    console.log('- access_token exists:', !!accessToken);
    console.log('- merchant_id exists:', !!merchantId);
    console.log('- profile_published:', profilePublished);

    if (accessToken && merchantId) {
      console.log('Storing credentials in localStorage');
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('merchant_id', merchantId);
      
      // Show appropriate message based on profile_published
      if (profilePublished === 'true') {
        toast.success('Successfully connected with Square!');
      } else {
        toast.warning('Connected with Square, but profile publishing failed. You can retry in settings.');
      }
      
      // Update profile state
      setProfile(prev => ({ ...prev, isConnected: true }));
      
      return true;
    }
    
    console.log('Invalid or missing OAuth callback parameters');
    return false;
  };

  // Initiate OAuth flow with Square
  const connectWithSquare = async (): Promise<boolean> => {
    try {
      console.log('Connecting with Square');
      // Check if we're on the callback route with query parameters
      if (window.location.pathname.includes('/auth/callback') || window.location.search.includes('access_token')) {
        console.log('On callback route, processing parameters');
        return handleOAuthCallback();
      }
      
      console.log('Not on callback route, this function shouldn\'t be called directly');
      // We should never reach here as the OAuth initiation is now handled directly in the Landing component
      return false;
    } catch (error) {
      console.error('Error connecting with Square:', error);
      toast.error('An error occurred while connecting with Square.');
      return false;
    }
  };

  // Save profile to backend
  const saveProfile = async (): Promise<boolean> => {
    try {
      console.log('Saving profile to backend');
      setIsLoading(true);
      
      // Convert our app format to backend format
      const merchantProfile: Partial<MerchantProfile> = {
        name: profile.name,
        display_name: profile.displayName,
        about: profile.about,
        website: profile.website,
        hashtags: profile.categories.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      
      console.log('Converted profile data for backend:', merchantProfile);
      
      // Add images if they've been changed
      if (profile.profilePicture) {
        // This is a simplification - in a real app you'd upload the file to a server
        // and then use the returned URL in the profile update
        console.log('Profile picture changed, but upload not implemented');
        toast.warning('Image uploads not implemented in this demo');
      }
      
      if (profile.bannerPicture) {
        console.log('Banner picture changed, but upload not implemented');
        toast.warning('Image uploads not implemented in this demo');
      }
      
      // Send update to backend
      const result = await updateMerchantProfile(merchantProfile);
      console.log('Profile update result:', result);
      
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
    console.log('Updating profile state with:', updatedProfile);
    setProfile({ ...profile, ...updatedProfile });
  };

  const resetProfile = () => {
    console.log('Resetting profile and clearing credentials');
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
