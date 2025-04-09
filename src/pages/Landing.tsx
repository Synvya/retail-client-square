import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { initiateSquareOAuth, pingBackend } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>((window as any).API_BASE_URL || 'http://localhost:8000');
  const [newApiUrl, setNewApiUrl] = useState<string>(apiUrl);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

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
        toast.error('Cannot connect to backend server. Please make sure your ngrok tunnel is active and properly configured.');
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
      const error = urlParams.get('error');
      
      // Handle any errors returned in the callback
      if (error) {
        console.error('OAuth error returned:', error);
        toast.error(`Square authorization failed: ${error}`);
        return false;
      }
      
      if (accessToken && merchantId) {
        console.log('OAuth callback detected, processing...');
        console.log('Access token:', accessToken.substring(0, 10) + '...');
        console.log('Merchant ID:', merchantId);
        
        // Store the tokens immediately to ensure they're available
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('merchant_id', merchantId);
        
        // Remove query parameters from URL to prevent reprocessing
        if (window.history && window.history.replaceState) {
          // Remove the query parameters but keep the path
          const cleanUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        const success = await connectWithSquare();
        if (success) {
          console.log('Successfully connected with Square, navigating to profile');
          navigate('/profile');
          return true;
        } else {
          console.error('Failed to connect with Square');
          toast.error('Square authorization failed');
          return false;
        }
      } else {
        console.log('No OAuth callback parameters found in URL');
        return false;
      }
    };
    
    // Only handle OAuth callback if we're on the callback route
    if (window.location.pathname.includes('/auth/callback') || window.location.search.includes('access_token')) {
      console.log('On callback route, processing OAuth parameters');
      handleOAuthCallback();
    }
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
      // Using the current origin as the callback URL with explicit protocol
      const protocol = window.location.protocol;
      const host = window.location.host;
      const callbackUrl = `${protocol}//${host}/auth/callback`;
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
    if (!newApiUrl) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(newApiUrl);
    } catch (e) {
      toast.error('Please enter a valid URL including http:// or https://');
      return;
    }
    
    if (newApiUrl !== apiUrl) {
      console.log(`Updating API URL from ${apiUrl} to ${newApiUrl}`);
      (window as any).API_BASE_URL = newApiUrl;
      setApiUrl(newApiUrl);
      localStorage.setItem('api_base_url', newApiUrl);
      toast.success('API URL updated! Testing connection...');
      
      // Test the new connection
      setTimeout(checkBackendConnection, 500);
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
              <p className="mb-2">The application cannot connect to your backend at {apiUrl}.</p>
              <p className="mb-2">Since you're running the backend locally at 127.0.0.1:8000, you need to create a public URL using ngrok that can reach your local server.</p>
              <p className="font-bold mb-2">Solutions:</p>
              <ol className="list-decimal list-inside mb-4">
                <li className="mb-1">Ensure your local server is running: <code className="bg-gray-100 px-2 py-1 rounded">127.0.0.1:8000</code></li>
                <li className="mb-1">In a separate terminal run: <code className="bg-gray-100 px-2 py-1 rounded">ngrok http 8000</code></li>
                <li className="mb-1">Copy the public HTTPS URL provided by ngrok (e.g. <code className="bg-gray-100 px-2 py-1 rounded">https://a1b2-123-45-67-89.ngrok-free.app</code>)</li>
                <li>Enter the ngrok URL below and click "Update & Test Connection"</li>
              </ol>
              
              <div className="flex items-center space-x-2 mb-4">
                <Input 
                  value={newApiUrl} 
                  onChange={(e) => setNewApiUrl(e.target.value)} 
                  placeholder="https://your-ngrok-url.ngrok-free.app"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSetApiUrl} 
                  variant="outline"
                  disabled={isCheckingConnection}
                >
                  {isCheckingConnection ? 'Testing...' : 'Update & Test'}
                </Button>
              </div>
              
              <p className="text-sm text-red-600 mb-2">Common issues:</p>
              <ul className="list-disc list-inside mb-2 text-sm">
                <li>Make sure to include <strong>https://</strong> in your ngrok URL</li>
                <li>Check that your ngrok tunnel is still active</li>
                <li>Ensure your backend server allows CORS from this domain</li>
                <li>If using a free ngrok plan, you might need to restart your tunnel frequently</li>
              </ul>
              
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
          <div className="mt-4 text-sm text-gray-500 flex items-center space-x-2">
            <span>Connected to backend at: {apiUrl}</span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm underline" 
              onClick={() => {
                setNewApiUrl(apiUrl);
                const urlInput = document.querySelector('input');
                if (urlInput) urlInput.focus();
              }}
            >
              Change
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
