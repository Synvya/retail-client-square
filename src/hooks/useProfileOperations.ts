
import { toast } from 'sonner';
import { updateMerchantProfile, getMerchantProfile } from '@/services/api';
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

      // First, get the current profile from the backend to preserve fields
      let existingMerchantProfile: Partial<MerchantProfile> = {};
      try {
        const response = await getMerchantProfile();
        if (response) {
          existingMerchantProfile = response;
          console.log('Retrieved existing merchant profile:', existingMerchantProfile);
        }
      } catch (error) {
        console.warn('Could not retrieve existing profile, will create new one:', error);
      }

      // Convert our app format to backend format, preserving existing fields
      const merchantProfile: Partial<MerchantProfile> = {
        // Include all existing fields from the backend
        ...existingMerchantProfile,

        // Override with the user's updated fields
        name: profile.name,
        display_name: profile.displayName,
        about: profile.about,
        website: profile.website,
        hashtags: profile.categories.split(',').map(tag => tag.trim()).filter(Boolean),
        profile_type: profile.businessType,
        
        // Always set the namespace to the required value
        namespace: "com.synvya.merchant"
      };

      // Special handling for nip05 - use the format name@synvya.com
      // Ensure the name doesn't have spaces and is lowercase for a valid nip05 identifier
      if (profile.name) {
        const normalizedName = profile.name.toLowerCase().replace(/\s+/g, '_');
        merchantProfile.nip05 = `${normalizedName}@synvya.com`;
        console.log('Setting nip05 identifier:', merchantProfile.nip05);
      }

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

      // First, get the current profile from the backend to preserve fields
      let existingMerchantProfile: Partial<MerchantProfile> = {};
      try {
        const response = await getMerchantProfile();
        if (response) {
          existingMerchantProfile = response;
          console.log('Retrieved existing merchant profile for republishing:', existingMerchantProfile);
        }
      } catch (error) {
        console.warn('Could not retrieve existing profile for republishing:', error);
      }

      // Use the same approach as saveProfile to preserve all fields
      const merchantProfile: Partial<MerchantProfile> = {
        // Include all existing fields from the backend
        ...existingMerchantProfile,

        // Override with the user's updated fields
        name: profile.name,
        display_name: profile.displayName,
        about: profile.about,
        website: profile.website,
        hashtags: profile.categories.split(',').map(tag => tag.trim()).filter(Boolean),
        profile_type: profile.businessType,
        
        // Always set the namespace to the required value
        namespace: "com.synvya.merchant"
      };

      // Special handling for nip05 - use the format name@synvya.com
      // Ensure the name doesn't have spaces and is lowercase for a valid nip05 identifier
      if (profile.name) {
        const normalizedName = profile.name.toLowerCase().replace(/\s+/g, '_');
        merchantProfile.nip05 = `${normalizedName}@synvya.com`;
        console.log('Setting nip05 identifier for republishing:', merchantProfile.nip05);
      }

      console.log('Sending profile data for republishing:', merchantProfile);

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
      businessType: 'retail',
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
