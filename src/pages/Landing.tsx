
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { initiateSquareOAuth } from '@/services/api';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    console.log('Landing page loaded');
    console.log('Current profile state:', profile);
    
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
  }, [profile.isConnected, navigate, connectWithSquare]);

  const handleConnectWithSquare = () => {
    console.log('Connect with Square button clicked');
    try {
      // Direct call to initiateSquareOAuth with the current origin
      const callbackUrl = `${window.location.origin}/auth/callback`;
      console.log(`Using callback URL: ${callbackUrl}`);
      
      // Call the OAuth function directly
      const initiated = initiateSquareOAuth(callbackUrl);
      
      if (!initiated) {
        console.error('Failed to initiate Square OAuth');
        toast.error('Failed to connect with Square');
      }
    } catch (error) {
      console.error('Error in handleConnectWithSquare:', error);
      toast.error('Failed to connect with Square');
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
        
        <Button 
          onClick={handleConnectWithSquare}
          className="rounded-full text-lg py-6 px-10 border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect with Square'}
        </Button>
      </div>
    </div>
  );
};

export default Landing;
