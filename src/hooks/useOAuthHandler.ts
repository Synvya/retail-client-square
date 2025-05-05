
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { initiateSquareOAuth } from '@/services/api';
import { useProfile } from '@/context/ProfileContext';
import { useNavigate } from 'react-router-dom';

export const useOAuthHandler = () => {
  const { connectWithSquare, profile, fetchProfileData } = useProfile();
  const navigate = useNavigate();
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [windowListener, setWindowListener] = useState(false);

  // Add a message listener for the OAuth popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      console.log('Received postMessage event:', event);
      
      // Make sure the message is from a trusted source
      if (event.origin.includes('squareupsandbox.com') || 
          event.origin.includes('retail-backend.synvya.com')) {
        
        console.log('Processing OAuth message from trusted source');
        const data = event.data;
        
        if (data && data.type === 'square-oauth-callback') {
          console.log('OAuth callback data received:', data);
          
          if (data.error) {
            setOauthError(`Square authorization failed: ${data.error}`);
            toast.error(`Square authorization failed: ${data.error}`);
          } else if (data.accessToken && data.merchantId) {
            // Store tokens
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('merchant_id', data.merchantId);
            localStorage.setItem('profile_published', data.profilePublished || 'false');
            
            toast.success('Successfully connected with Square!');
            connectWithSquare().then(success => {
              if (success) {
                console.log('Successfully connected with Square, fetching profile data...');
                // Force refresh profile data
                if (fetchProfileData) {
                  fetchProfileData().then(profileSuccess => {
                    console.log('Profile fetch result:', profileSuccess);
                    if (profileSuccess) {
                      navigate('/profile');
                    } else {
                      toast.error('Connected but failed to load profile data. Please try again.');
                    }
                  });
                } else {
                  console.error('fetchProfileData function not available');
                  navigate('/profile');
                }
              }
            });
          }
        }
      }
    };

    if (!windowListener) {
      console.log('Adding window message listener for OAuth callbacks');
      window.addEventListener('message', handleOAuthMessage);
      setWindowListener(true);
    }
    
    return () => {
      if (windowListener) {
        console.log('Removing window message listener');
        window.removeEventListener('message', handleOAuthMessage);
      }
    };
  }, [connectWithSquare, navigate, windowListener, fetchProfileData]);

  const handleConnectWithSquare = async (backendStatus: 'checking' | 'online' | 'offline') => {
    console.log('Connect with Square button clicked');
    setOauthError(null);
    
    if (backendStatus === 'offline') {
      toast.error('Cannot connect to backend server. Please try again later.');
      return;
    }
    
    setIsInitiatingOAuth(true);
    
    try {
      console.log('Initiating Square OAuth flow');
      await initiateSquareOAuth();
      
      // We won't set isInitiatingOAuth to false immediately because the OAuth flow
      // continues in a new window, and we'll handle completion in the message listener
      setTimeout(() => {
        setIsInitiatingOAuth(false);
      }, 5000); // Reset state after 5 seconds so button becomes clickable again
      
    } catch (error) {
      console.error('Error initiating Square OAuth:', error);
      toast.error('Failed to connect with Square. Please try again later.');
      setOauthError('Failed to initiate Square connection. Please try again later.');
      setIsInitiatingOAuth(false);
    }
  };

  const processOAuthCallback = useCallback(async () => {
    console.log('Checking for OAuth callback in URL');
      
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash && window.location.hash.startsWith('#') 
      ? new URLSearchParams(window.location.hash.substring(1)) 
      : new URLSearchParams('');
    
    console.log('URL search params:', window.location.search);
    console.log('URL hash params:', window.location.hash);
    
    const code = urlParams.get('code') || hashParams.get('code');
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const merchantId = urlParams.get('merchant_id') || hashParams.get('merchant_id');
    const profilePublished = urlParams.get('profile_published') || hashParams.get('profile_published');
    const error = urlParams.get('error') || hashParams.get('error');
    
    console.log('OAuth callback params:', { code, accessToken, merchantId, profilePublished, error });
    
    if (error) {
      console.error('OAuth error returned:', error);
      toast.error(`Square authorization failed: ${error}`);
      setOauthError(`Square authorization failed: ${error}`);
      return false;
    }
    
    if (code && !accessToken) {
      console.log('Received authorization code but no access token');
      toast.error('Authorization incomplete. Please try again.');
      setOauthError('Square authorization was not completed properly. Please try again.');
      return false;
    }
    
    if (accessToken && merchantId) {
      console.log('OAuth callback detected, processing...');
      console.log('Access token received:', accessToken.substring(0, 5) + '...');
      console.log('Merchant ID:', merchantId);
      console.log('Profile published status:', profilePublished);
      
      // Store tokens and profile status
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('merchant_id', merchantId);
      localStorage.setItem('profile_published', profilePublished || 'false');
      
      // Clean URL after processing OAuth parameters
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.href.split('?')[0].split('#')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      // Only show success message if profile was published successfully
      if (profilePublished === 'true') {
        toast.success('Successfully connected with Square and published your profile!');
      } else {
        // Stay silent about profile publishing if the value is false
        toast.success('Successfully connected with Square!');
      }
      
      const success = await connectWithSquare();
      if (success) {
        console.log('Successfully connected with Square, navigating to profile');
        // Force refresh profile data
        fetchProfileData && fetchProfileData();
        navigate('/profile');
        return true;
      } else {
        console.error('Failed to connect with Square');
        toast.error('Square authorization failed');
        setOauthError('Failed to connect with Square after authorization. Please try again.');
        return false;
      }
    }
    
    return false;
  }, [connectWithSquare, navigate, fetchProfileData]);

  return {
    isInitiatingOAuth,
    oauthError,
    handleConnectWithSquare,
    processOAuthCallback,
    isConnected: profile.isConnected,
    fetchProfileData
  };
};
