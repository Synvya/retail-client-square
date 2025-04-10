import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import Logo from '@/components/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Visualization = () => {
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [iframeError, setIframeError] = useState(false);

  // Redirect to landing if not connected
  useEffect(() => {
    if (!profile.isConnected) {
      navigate('/');
    }
  }, [profile.isConnected, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl">Loading visualization...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-4xl">
        <div className="w-full flex justify-between items-center mb-8">
          <Logo />
          <div className="text-md font-semibold text-green-600">
            Status: Connected
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">Visualization page</h1>

        {profile.publicKey ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="font-medium">Public Key:</span> {profile.publicKey}
              </div>
            </div>

            <div className="w-full bg-white rounded-3xl border-2 border-synvya-dark p-4 mb-8">
              <div className="aspect-video w-full">
                {iframeError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center p-4">
                      <p className="text-lg font-medium mb-2">Unable to load profile visualization</p>
                      <p className="text-sm text-gray-600">The visualization service might be unavailable or the public key is not yet registered.</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://www.nosta.me/${profile.publicKey}`}
                    className="w-full h-full border-0 rounded-lg"
                    title="Nosta.me Profile"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onError={() => setIframeError(true)}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <Alert className="mb-8">
            <AlertDescription>
              No public key available. Please ensure your profile has been published successfully.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/profile')}
            className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
            variant="outline"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
