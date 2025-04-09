
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import Logo from '@/components/Logo';

const Landing = () => {
  const { connectWithSquare, profile, isLoading } = useProfile();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (profile.isConnected) {
      navigate('/profile');
    }
    
    // Handle OAuth callback if present in URL
    const handleOAuthCallback = async () => {
      if (window.location.search.includes('access_token')) {
        const success = await connectWithSquare();
        if (success) {
          navigate('/profile');
        }
      }
    };
    
    handleOAuthCallback();
  }, [profile.isConnected, navigate, connectWithSquare]);

  const handleConnectWithSquare = async () => {
    await connectWithSquare();
    // No need for navigation here as the OAuth flow will redirect the user
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
