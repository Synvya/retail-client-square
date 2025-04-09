
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

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
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  connectWithSquare: () => Promise<boolean>;
  saveProfile: () => Promise<boolean>;
  resetProfile: () => void;
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
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  // Mock function to simulate connecting with Square
  const connectWithSquare = async (): Promise<boolean> => {
    try {
      // This is where you would make an API call to your backend
      console.log('Connecting to Square...');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% chance of success for testing
      const success = Math.random() < 0.9;
      
      if (success) {
        // Mock successful connection and profile data retrieval
        setProfile({
          ...profile,
          isConnected: true,
          name: 'John Doe',
          displayName: 'JD Business',
          about: 'My awesome business description',
          website: 'https://example.com',
          categories: 'retail, food, service',
          profilePictureUrl: null,
          bannerPictureUrl: null,
        });
        toast.success('Successfully connected with Square!');
        return true;
      } else {
        toast.error('Failed to connect with Square. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error connecting with Square:', error);
      toast.error('An error occurred while connecting with Square.');
      return false;
    }
  };

  // Mock function to simulate saving profile to backend
  const saveProfile = async (): Promise<boolean> => {
    try {
      console.log('Saving profile...', profile);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    }
  };

  const updateProfile = (updatedProfile: Partial<Profile>) => {
    setProfile({ ...profile, ...updatedProfile });
  };

  const resetProfile = () => {
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
