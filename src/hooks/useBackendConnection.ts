
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { pingBackend } from '@/services/api';

export const useBackendConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const hasNotifiedSuccess = useRef(false);
  
  const checkBackendConnection = async () => {
    if (isCheckingConnection) return; // Prevent multiple simultaneous checks
    
    console.log('Checking backend status...');
    setIsCheckingConnection(true);
    setBackendStatus('checking');
    
    try {
      const isOnline = await pingBackend();
      console.log('Backend status result:', isOnline);
      
      if (isOnline) {
        setBackendStatus('online');
        // Only show success toast once
        if (!hasNotifiedSuccess.current) {
          toast.success('Connected to backend successfully!');
          hasNotifiedSuccess.current = true;
        }
      } else {
        console.error('Backend connection failed');
        setBackendStatus('offline');
        // Reset success notification flag when offline
        hasNotifiedSuccess.current = false;
        toast.error('Cannot connect to backend server. Please check if the server is running.');
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
      // Reset success notification flag when offline
      hasNotifiedSuccess.current = false;
      toast.error('Failed to connect to backend server');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Initial check on mount only
  useEffect(() => {
    console.log('useBackendConnection hook initialized, checking backend status...');
    checkBackendConnection();
    
    // Only retry if offline - with reduced frequency
    const retryInterval = window.setInterval(() => {
      if (backendStatus === 'offline' && !isCheckingConnection) {
        console.log('Retrying backend connection check...');
        checkBackendConnection();
      }
    }, 30000); // Retry every 30 seconds instead of 10
    
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
