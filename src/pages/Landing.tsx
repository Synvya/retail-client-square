
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import Logo from '@/components/Logo';

const Landing = () => {
  const { connectWithSquare } = useProfile();
  const navigate = useNavigate();

  const handleConnectWithSquare = async () => {
    const success = await connectWithSquare();
    if (success) {
      navigate('/profile');
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
          Powerful presence for the agentic era
        </p>
        
        <Button 
          onClick={handleConnectWithSquare}
          className="rounded-full text-lg py-6 px-10 border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50"
          variant="outline"
        >
          Connect with Square
        </Button>
      </div>
    </div>
  );
};

export default Landing;
