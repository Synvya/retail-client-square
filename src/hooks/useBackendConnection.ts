
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { pingBackend } from '@/services/api';

export const useBackendConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

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

  // Initial check with auto-retry
  useEffect(() => {
    console.log('useBackendConnection hook initialized, checking backend status...');
    checkBackendConnection();
    
    // Set up a retry interval if initial check fails
    const retryInterval = setInterval(() => {
      if (backendStatus === 'offline') {
        console.log('Retrying backend connection check...');
        checkBackendConnection();
      } else {
        clearInterval(retryInterval);
      }
    }, 5000); // Retry every 5 seconds
    
    return () => clearInterval(retryInterval);
  }, []);  // Empty dependency array means this effect runs once on mount

  return {
    backendStatus,
    isCheckingConnection,
    checkBackendConnection
  };
};
