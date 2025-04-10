
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { initiateSquareOAuth, pingBackend } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check backend status on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    console.log('Checking backend status...');
    setIsCheckingConnection(true);
    setBackendStatus('checking');
    
    try {
      const isOnline = await pingBackend();
      console.log('Backend status result:', isOnline);
      setBackendStatus(isOnline ? 'online' : 'offline');
      
      if (isOnline) {
        toast.success('Connected to backend successfully!');
      } else {
        toast.error('Cannot connect to backend server. Please check if the server is running.');
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
      toast.error('Failed to connect to backend server');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Check if user is already authenticated and handle OAuth callback
  useEffect(() => {
    console.log('Landing page loaded');
    console.log('Current profile state:', profile);
    console.log('Backend status:', backendStatus);
    
    // If already connected, navigate to profile
    if (profile.isConnected) {
      console.log('User is already connected, redirecting to profile');
      navigate('/profile');
      return;
    }
    
    // Handle OAuth callback if present in URL
    const handleOAuthCallback = async () => {
      console.log('Checking for OAuth callback in URL');
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const merchantId = urlParams.get('merchant_id');
      const profilePublished = urlParams.get('profile_published');
      const error = urlParams.get('error');
      
      // Handle any errors returned in the callback
      if (error) {
        console.error('OAuth error returned:', error);
        toast.error(`Square authorization failed: ${error}`);
        setOauthError(`Square authorization failed: ${error}`);
        return false;
      }
      
      if (accessToken && merchantId) {
        console.log('OAuth callback detected, processing...');
        console.log('Access token:', accessToken.substring(0, 10) + '...');
        console.log('Merchant ID:', merchantId);
        console.log('Profile published:', profilePublished);
        
        // Store the tokens and profile status immediately to ensure they're available
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('merchant_id', merchantId);
        localStorage.setItem('profile_published', profilePublished || 'false');
        
        // Remove query parameters from URL to prevent reprocessing
        if (window.history && window.history.replaceState) {
          // Remove the query parameters but keep the path
          const cleanUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        // Show appropriate toast based on profile_published status
        if (profilePublished === 'true') {
          toast.success('Successfully connected with Square and published your profile!');
        } else {
          toast.warning('Connected with Square, but profile publishing failed. You can retry in settings.');
        }
        
        const success = await connectWithSquare();
        if (success) {
          console.log('Successfully connected with Square, navigating to profile');
          navigate('/profile');
          return true;
        } else {
          console.error('Failed to connect with Square');
          toast.error('Square authorization failed');
          setOauthError('Failed to connect with Square after authorization. Please try again.');
          return false;
        }
      } else {
        console.log('No OAuth callback parameters found in URL');
        return false;
      }
    };
    
    // Only handle OAuth callback if we're on the callback route or have query parameters
    if (window.location.pathname.includes('/auth/callback') || window.location.search.includes('access_token')) {
      console.log('On callback route, processing OAuth parameters');
      handleOAuthCallback();
    }
  }, [profile.isConnected, navigate, connectWithSquare, backendStatus]);

  const handleConnectWithSquare = async () => {
    console.log('Connect with Square button clicked');
    setOauthError(null);
    
    if (backendStatus === 'offline') {
      toast.error('Cannot connect to backend server. Please try again later.');
      return;
    }
    
    setIsInitiatingOAuth(true);
    
    try {
      console.log('Initiating Square OAuth flow');
      // Using the current origin as the callback URL with explicit protocol
      const protocol = window.location.protocol;
      const host = window.location.host;
      const callbackUrl = `${protocol}//${host}/auth/callback`;
      console.log(`Using callback URL: ${callbackUrl}`);
      
      await initiateSquareOAuth(callbackUrl);
      // The redirect will happen automatically if successful
    } catch (error) {
      console.error('Error in handleConnectWithSquare:', error);
      toast.error('Failed to connect with Square. Please try again later.');
      setOauthError('Failed to initiate Square connection. Please try again later.');
      setIsInitiatingOAuth(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl rounded-3xl border-2 border-synvya-dark p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2">
          <Logo />
          <h1 className="text-4xl font-bold text-synvya-dark">Synvya</h1>
        </div>
        
        <p className="text-xl text-synvya-dark text-center mb-8 mt-4">
          Powering commerce for the agentic era
        </p>
        
        {backendStatus === 'checking' && (
          <p className="text-yellow-600 mb-4 flex items-center">
            <RefreshCw className="animate-spin h-4 w-4 mr-2" />
            Checking backend connection...
          </p>
        )}
        
        {backendStatus === 'offline' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Backend Connection Failed</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The application cannot connect to the backend server.</p>
              <p className="mb-2">Please ensure the backend service is running and accessible.</p>
              
              <Button 
                onClick={checkBackendConnection} 
                variant="secondary" 
                className="w-full mt-2"
                disabled={isCheckingConnection}
              >
                {isCheckingConnection ? (
                  <><RefreshCw className="animate-spin h-4 w-4 mr-2" /> Testing Connection...</>
                ) : (
                  <>Retry Connection Test</>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {backendStatus === 'online' && (
          <Alert variant="default" className="mb-6 border-green-500 bg-green-50">
            <AlertTitle className="text-green-700">Backend Connected</AlertTitle>
            <AlertDescription className="text-green-700">
              Successfully connected to backend server
            </AlertDescription>
          </Alert>
        )}
        
        {oauthError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{oauthError}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleConnectWithSquare}
          className="rounded-full text-lg py-6 px-10 border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50"
          variant="outline"
          disabled={isLoading || isInitiatingOAuth || backendStatus !== 'online'}
        >
          {isLoading || isInitiatingOAuth ? 'Connecting...' : 'Connect with Square'}
        </Button>
      </div>
    </div>
  );
};

export default Landing;
