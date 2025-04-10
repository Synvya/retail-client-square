
import { toast } from 'sonner';
import { updateMerchantProfile } from '@/services/api';
import { Profile, MerchantProfile } from '@/types/profile';

export const useProfileOperations = (
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
    setProfile({
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
    });
  };

  return {
    updateProfile,
    saveProfile,
    resetProfile,
    republishProfile
  };
};
