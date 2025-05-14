
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/Logo';
import { useBackendConnection } from '@/hooks/useBackendConnection';
import { useOAuthHandler } from '@/hooks/useOAuthHandler';
import BackendStatusAlert from '@/components/landing/BackendStatusAlert';
import OAuthErrorAlert from '@/components/landing/OAuthErrorAlert';

const Landing = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { backendStatus, isCheckingConnection, checkBackendConnection } = useBackendConnection();
  const { 
    isInitiatingOAuth, 
    oauthError, 
    handleConnectWithSquare, 
    processOAuthCallback,
    isConnected,
    clearAuthData
  } = useOAuthHandler();

  useEffect(() => {
    console.log('Landing page loaded');
    console.log('Current URL:', window.location.href);
    console.log('Is in iframe:', window.location !== window.parent.location);
    
    if (isConnected) {
      console.log('User is already connected, redirecting to profile');
      navigate('/profile');
      return;
    }
    
    const hasOAuthParams = 
      window.location.pathname.includes('/auth/callback') || 
      window.location.search.includes('code=') || 
      window.location.search.includes('access_token') || 
      window.location.hash.includes('code=') ||
      window.location.hash.includes('access_token');
    
    if (hasOAuthParams) {
      console.log('OAuth parameters detected, processing callback');
      processOAuthCallback();
    } else {
      console.log('No OAuth parameters detected, ensuring fresh state');
      clearAuthData && clearAuthData();
    }
  }, [isConnected, navigate, processOAuthCallback, clearAuthData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl rounded-3xl border-2 border-synvya-dark p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2">
          <Logo />
          <h1 className="text-4xl font-bold text-synvya-dark">Synvya</h1>
        </div>
        
        <p className="text-xl text-synvya-dark text-center mb-8 mt-4">
          Empower Your Small Business
        </p>
        
        <BackendStatusAlert 
          status={backendStatus} 
          onRetry={checkBackendConnection}
          isCheckingConnection={isCheckingConnection}
        />
        
        <OAuthErrorAlert error={oauthError} />
        
        <Button 
          onClick={() => handleConnectWithSquare(backendStatus)}
          className="rounded-full text-lg py-6 px-10 border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50"
          variant="outline"
          disabled={isInitiatingOAuth || backendStatus !== 'online' || !termsAccepted}
        >
          {isInitiatingOAuth ? 'Connecting...' : 'Connect with Square'}
        </Button>
        
        <div className="flex items-start space-x-2 mt-4 mb-3 w-full max-w-md">
          <Checkbox 
            id="terms" 
            checked={termsAccepted} 
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-1"
          />
          <label 
            htmlFor="terms" 
            className="text-sm text-gray-700 cursor-pointer"
          >
            I have read and agree to be bound by the{' '}
            <a 
              href="https://www.synvya.com/#scr-terms" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="https://www.synvya.com/#scr-privacy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </a>.
          </label>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Log in to your Square account on a separate tab before clicking on Connect with Square
        </p>
      </div>
    </div>
  );
};

export default Landing;
