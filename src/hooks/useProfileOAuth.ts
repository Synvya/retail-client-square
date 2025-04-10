
import { Profile } from '@/types/profile';

export const useProfileOAuth = (
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Function to handle Square OAuth callback
  const handleOAuthCallback = () => {
    console.log('Processing OAuth callback');
    
    // Verify if tokens are stored in localStorage
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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectWithSquare
  };
};
