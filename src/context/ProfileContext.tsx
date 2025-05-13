
import React, { createContext, useContext, ReactNode } from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileOAuth } from '@/hooks/useProfileOAuth';
import { useProfileOperations } from '@/hooks/useProfileOperations';
import { ProfileContextType, defaultProfile } from '@/types/profile';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { profile, setProfile, isLoading, setIsLoading, fetchProfileData, clearAuthData, isAuthenticated } = useProfileData();
  const { connectWithSquare } = useProfileOAuth(profile, setProfile, setIsLoading);
  const { updateProfile, saveProfile, resetProfile, republishProfile } = useProfileOperations(
    profile, 
    setProfile, 
    setIsLoading
  );

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
        fetchProfileData,
        clearAuthData,
        isAuthenticated,
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
