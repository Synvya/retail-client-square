
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { initiateSquareOAuth, pingBackend } from '@/services/api';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await pingBackend();
      setBackendStatus(isOnline ? 'online' : 'offline');
    };
    
    checkBackend();
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    console.log('Landing page loaded');
    console.log('Current profile state:', profile);
    console.log('Backend status:', backendStatus);
    
    if (profile.isConnected) {
      console.log('User is already connected, redirecting to profile');
      navigate('/profile');
    }
    
    // Handle OAuth callback if present in URL
    const handleOAuthCallback = async () => {
      console.log('Checking for OAuth callback in URL');
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const merchantId = urlParams.get('merchant_id');
      
      if (accessToken && merchantId) {
        console.log('OAuth callback detected, processing...');
        console.log('Access token:', accessToken.substring(0, 10) + '...');
        console.log('Merchant ID:', merchantId);
        
        // Store the tokens immediately to ensure they're available
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('merchant_id', merchantId);
        
        const success = await connectWithSquare();
        if (success) {
          console.log('Successfully connected with Square, navigating to profile');
          navigate('/profile');
        } else {
          console.error('Failed to connect with Square');
          toast.error('Square authorization failed');
        }
      } else {
        console.log('No OAuth callback parameters found in URL');
      }
    };
    
    handleOAuthCallback();
  }, [profile.isConnected, navigate, connectWithSquare, backendStatus]);

  const handleConnectWithSquare = async () => {
    console.log('Connect with Square button clicked');
    
    if (backendStatus === 'offline') {
      toast.error('Cannot connect to backend server. Please make sure it is running at http://localhost:8000');
      return;
    }
    
    setIsInitiatingOAuth(true);
    
    try {
      // Direct call to initiateSquareOAuth with the current origin
      const callbackUrl = `${window.location.origin}/auth/callback`;
      console.log(`Using callback URL: ${callbackUrl}`);
      
      // Call the OAuth function directly
      const initiated = await initiateSquareOAuth(callbackUrl);
      
      if (!initiated) {
        console.error('Failed to initiate Square OAuth');
        toast.error('Failed to connect with Square. Please check console for details.');
      }
    } catch (error) {
      console.error('Error in handleConnectWithSquare:', error);
      toast.error('Failed to connect with Square. Please check console for details.');
    } finally {
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
        
        <p className="text-xl text-synvya-dark text-center mb-16 mt-4">
          Powering commerce for the agentic era
        </p>
        
        {backendStatus === 'checking' && (
          <p className="text-yellow-600 mb-4">Checking backend connection...</p>
        )}
        
        {backendStatus === 'offline' && (
          <p className="text-red-600 mb-4">
            Cannot connect to backend server. Please make sure it is running at http://localhost:8000
          </p>
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
