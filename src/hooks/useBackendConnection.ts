
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { pingBackend } from '@/services/api';

export const useBackendConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const hasNotifiedRef = useRef(false);
  
  const checkBackendConnection = async (silent = false) => {
    if (isCheckingConnection) return; // Prevent multiple simultaneous checks
    
    console.log('Checking backend connection, silent mode:', silent);
    setIsCheckingConnection(true);
    setBackendStatus('checking');
    
    try {
      console.log('Attempting to ping backend');
      const isOnline = await pingBackend();
      console.log('Backend ping result:', isOnline);
      
      if (isOnline) {
        console.log('Backend connection successful');
        setBackendStatus('online');
        // Only show success toast once per session and not on silent checks
        if (!hasNotifiedRef.current && !silent) {
          toast.success('Connected to backend successfully!');
          hasNotifiedRef.current = true;
        }
      } else {
        console.log('Backend connection failed');
        setBackendStatus('offline');
        // Reset notification flag when offline
        hasNotifiedRef.current = false;
        
        // Only show error toast if not a silent check
        if (!silent) {
          toast.error('Cannot connect to backend server. Please check if the server is running.');
        }
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
      // Reset notification flag when offline
      hasNotifiedRef.current = false;
      
      // Only show error toast if not a silent check
      if (!silent) {
        toast.error('Failed to connect to backend server');
      }
    } finally {
      setIsCheckingConnection(false);
      console.log('Connection check completed. Status:', backendStatus);
    }
  };

  // Single check on mount only
  useEffect(() => {
    console.log('useBackendConnection hook initialized');
    // Run initial check silently - no toasts
    checkBackendConnection(true);
    
    // Manual retry on offline is still available through the UI
    // but we don't set up an automatic retry interval
    
    // Optional: you could still have a very infrequent retry, like once every 2-5 minutes
    // const retryInterval = window.setInterval(() => {
    //   if (backendStatus === 'offline' && !isCheckingConnection) {
    //     checkBackendConnection(true); // Silent retry
    //   }
    // }, 300000); // Every 5 minutes
    
    // return () => {
    //   window.clearInterval(retryInterval);
    // };
  }, []); // Empty dependency array - only runs once on mount

  return {
    backendStatus,
    isCheckingConnection,
    checkBackendConnection: () => checkBackendConnection(false) // Expose non-silent version for manual retries
  };
};
