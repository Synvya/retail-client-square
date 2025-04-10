
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
  profilePublished: boolean;
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  connectWithSquare: () => Promise<boolean>;
  saveProfile: () => Promise<boolean>;
  resetProfile: () => void;
  isLoading: boolean;
  republishProfile: () => Promise<boolean>;
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
  profilePublished: false,
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
        publicKey: merchantProfile.nip05?.split('@')?.[0] || '',
        profilePublished: localStorage.getItem('profile_published') === 'true',
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
    
    // We don't need to check URL params here as that's now handled in the Landing component
    // Just verify if tokens are stored in localStorage
    const accessToken = localStorage.getItem('access_token');
    const merchantId = localStorage.getItem('merchant_id');
    const profilePublished = localStorage.getItem('profile_published') === 'true';

    console.log('Checking stored credentials:');
    console.log('- access_token exists:', !!accessToken);
    console.log('- merchant_id exists:', !!merchantId);
    console.log('- profile_published:', profilePublished);

    if (accessToken && merchantId) {
      console.log('Valid credentials found');
      
      // Update profile state
      setProfile(prev => ({ 
        ...prev, 
        isConnected: true,
        profilePublished: profilePublished
      }));
      
      return true;
    }
    
    console.log('Invalid or missing credentials');
    return false;
  };

  // Initiate OAuth flow with Square
  const connectWithSquare = async (): Promise<boolean> => {
    try {
      console.log('Connecting with Square');
      setIsLoading(true);
      
      // If we're already on the callback route, process the token
      if (window.location.pathname.includes('/auth/callback') || 
          window.location.search.includes('access_token')) {
        console.log('On callback route, processing parameters');
        return handleOAuthCallback();
      }
      
      // This should never happen as OAuth is initiated directly in Landing component
      console.log('Not on callback route, unexpected call to connectWithSquare');
      return false;
    } catch (error) {
      console.error('Error connecting with Square:', error);
      toast.error('An error occurred while connecting with Square.');
      return false;
    } finally {
      setIsLoading(false);
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
      
      // Update profile published status based on the result
      if (result && result.success) {
        localStorage.setItem('profile_published', 'true');
        setProfile(prev => ({ ...prev, profilePublished: true }));
        toast.success('Profile updated and published successfully!');
      } else {
        localStorage.setItem('profile_published', 'false');
        setProfile(prev => ({ ...prev, profilePublished: false }));
        toast.error('Profile updated but publishing failed. You can retry publishing later.');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Republish profile to Nostr
  const republishProfile = async (): Promise<boolean> => {
    try {
      console.log('Republishing profile to Nostr');
      setIsLoading(true);
      
      // Use the same API endpoint as saveProfile
      const merchantProfile: Partial<MerchantProfile> = {
        name: profile.name,
        display_name: profile.displayName,
        about: profile.about,
        website: profile.website,
        hashtags: profile.categories.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      
      const result = await updateMerchantProfile(merchantProfile);
      
      if (result && result.success) {
        localStorage.setItem('profile_published', 'true');
        setProfile(prev => ({ ...prev, profilePublished: true }));
        toast.success('Profile successfully published to Nostr!');
        return true;
      } else {
        toast.error('Failed to publish profile to Nostr. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error republishing profile:', error);
      toast.error('Failed to publish profile. Please try again.');
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
    localStorage.removeItem('profile_published');
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
        republishProfile,
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
