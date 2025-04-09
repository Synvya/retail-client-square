
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { initiateSquareOAuth, pingBackend } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>((window as any).API_BASE_URL || 'http://localhost:8000');

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      console.log('Checking backend status...');
      try {
        const isOnline = await pingBackend();
        console.log('Backend status result:', isOnline);
        setBackendStatus(isOnline ? 'online' : 'offline');
        
        if (!isOnline) {
          toast.error('Cannot connect to backend server. Please follow the instructions to set up your backend connection.');
        }
      } catch (error) {
        console.error('Error checking backend status:', error);
        setBackendStatus('offline');
        toast.error('Failed to connect to backend server');
      }
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
      toast.error('Cannot connect to backend server. Please follow the instructions to set up your backend connection.');
      return;
    }
    
    setIsInitiatingOAuth(true);
    
    try {
      console.log('Initiating Square OAuth flow');
      // Using the current origin as the callback URL
      const callbackUrl = `${window.location.origin}/auth/callback`;
      console.log(`Using callback URL: ${callbackUrl}`);
      
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

  const handleSetApiUrl = () => {
    const newUrl = prompt('Enter your ngrok or public backend URL:', apiUrl);
    if (newUrl && newUrl !== apiUrl) {
      (window as any).API_BASE_URL = newUrl;
      setApiUrl(newUrl);
      localStorage.setItem('api_base_url', newUrl);
      toast.success('API URL updated! Please refresh the page to apply changes.');
      // Force reload to apply the new URL
      window.location.reload();
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
          <p className="text-yellow-600 mb-4">Checking backend connection...</p>
        )}
        
        {backendStatus === 'offline' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Backend Connection Failed</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The application cannot connect to your local backend at {apiUrl}.</p>
              <p className="mb-2">Since you're running the backend locally at 127.0.0.1:8000, you need to create a public URL that can reach your local server.</p>
              <p className="font-bold mb-2">Solutions:</p>
              <ol className="list-decimal list-inside mb-4">
                <li className="mb-1">Install ngrok: <a href="https://ngrok.com/download" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">ngrok.com/download <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li className="mb-1">Run your local server: <code className="bg-gray-100 px-2 py-1 rounded">127.0.0.1:8000</code></li>
                <li className="mb-1">In a separate terminal run: <code className="bg-gray-100 px-2 py-1 rounded">ngrok http 8000</code></li>
                <li>Click the button below to set the public URL provided by ngrok</li>
              </ol>
              <Button onClick={handleSetApiUrl} variant="outline" className="w-full">
                Configure Backend URL
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {backendStatus === 'online' && (
          <Alert variant="default" className="mb-6 border-green-500 bg-green-50">
            <AlertTitle className="text-green-700">Backend Connected</AlertTitle>
            <AlertDescription className="text-green-700">
              Successfully connected to backend at {apiUrl}
            </AlertDescription>
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
        
        {backendStatus === 'online' && (
          <p className="mt-4 text-sm text-gray-500">
            Connected to backend at: {apiUrl}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm underline ml-2" 
              onClick={handleSetApiUrl}
            >
              Change
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Landing;
