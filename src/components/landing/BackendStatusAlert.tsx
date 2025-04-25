
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface BackendStatusAlertProps {
  status: 'checking' | 'online' | 'offline';
  onRetry: () => void;
  isCheckingConnection: boolean;
}

const LoadingDots = () => (
  <span className="ml-1 inline-flex">
    <span className="animate-[bounce_1.4s_infinite_.1s] rounded-full">.</span>
    <span className="animate-[bounce_1.4s_infinite_.2s] rounded-full">.</span>
    <span className="animate-[bounce_1.4s_infinite_.3s] rounded-full">.</span>
  </span>
);

const BackendStatusAlert = ({ 
  status, 
  onRetry, 
  isCheckingConnection 
}: BackendStatusAlertProps) => {
  if (status === 'checking') {
    return (
      <p className="text-yellow-600 mb-4 flex items-center">
        <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
        Checking backend connection
        <LoadingDots />
      </p>
    );
  }

  if (status === 'offline') {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Backend Connection Failed</AlertTitle>
        <AlertDescription>
          <p className="mb-2">The application cannot connect to the backend server.</p>
          <p className="mb-2">Please ensure the backend service is running and accessible.</p>
          
          <Button 
            onClick={onRetry} 
            variant="secondary" 
            className="w-full mt-2"
            disabled={isCheckingConnection}
          >
            {isCheckingConnection ? (
              <>Checking Connection<LoadingDots /></>
            ) : (
              <>Retry Connection Test</>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'online') {
    return (
      <Alert variant="default" className="mb-6 border-green-500 bg-green-50">
        <AlertTitle className="text-green-700">Backend Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Successfully connected to backend server
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default BackendStatusAlert;
