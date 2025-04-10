
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { pingBackend } from '@/services/api';

export const useBackendConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const checkBackendConnection = async () => {
    if (isCheckingConnection) return; // Prevent multiple simultaneous checks
    
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
        console.error('Backend connection failed');
        toast.error('Cannot connect to backend server. Please check if the server is running.');
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
      toast.error('Failed to connect to backend server');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    console.log('useBackendConnection hook initialized, checking backend status...');
    checkBackendConnection();
    
    // Set up a single retry interval if offline
    const retryInterval = window.setInterval(() => {
      if (backendStatus === 'offline' && !isCheckingConnection) {
        console.log('Retrying backend connection check...');
        checkBackendConnection();
      }
    }, 10000); // Retry every 10 seconds
    
    return () => {
      window.clearInterval(retryInterval);
    };
  }, [backendStatus, isCheckingConnection]);

  return {
    backendStatus,
    isCheckingConnection,
    checkBackendConnection
  };
};
