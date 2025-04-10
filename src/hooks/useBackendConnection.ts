
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { pingBackend } from '@/services/api';

export const useBackendConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const hasNotifiedSuccess = useRef(false);
  const isInitialCheck = useRef(true);
  
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
        // Only show success toast once per session and not on initial check
        if (!hasNotifiedSuccess.current && !isInitialCheck.current) {
          toast.success('Connected to backend successfully!');
          hasNotifiedSuccess.current = true;
        }
      } else {
        console.error('Backend connection failed');
        setBackendStatus('offline');
        // Reset success notification flag when offline
        hasNotifiedSuccess.current = false;
        
        // Only show error toast if not during initial silent check
        if (!isInitialCheck.current) {
          toast.error('Cannot connect to backend server. Please check if the server is running.');
        }
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
      // Reset success notification flag when offline
      hasNotifiedSuccess.current = false;
      
      // Only show error toast if not during initial silent check
      if (!isInitialCheck.current) {
        toast.error('Failed to connect to backend server');
      }
    } finally {
      setIsCheckingConnection(false);
      // After first check is done, we're no longer in initial check
      isInitialCheck.current = false;
    }
  };

  // Initial check on mount only
  useEffect(() => {
    console.log('useBackendConnection hook initialized, checking backend status...');
    // Do the initial check
    checkBackendConnection();
    
    // Only retry if offline - with reduced frequency
    const retryInterval = window.setInterval(() => {
      if (backendStatus === 'offline' && !isCheckingConnection) {
        console.log('Retrying backend connection check...');
        checkBackendConnection();
      }
    }, 60000); // Retry every 60 seconds instead of 30
    
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
