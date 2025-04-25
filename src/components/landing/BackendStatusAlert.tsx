
import React from 'react';
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

  return null;
};

export default BackendStatusAlert;
