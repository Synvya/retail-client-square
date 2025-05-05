
import api from './core';

// Update the Square OAuth endpoint with cross-domain iframe handling
export const initiateSquareOAuth = async () => {
  try {
    // Get the current host from the URL
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    
    console.log('OAuth initialization details:', {
      currentHost,
      protocol,
      isInIframe: window.location !== window.parent.location,
      fullUrl: window.location.href
    });

    // Check if we're in the Lovable preview iframe
    const isInIframe = window.location !== window.parent.location;
    
    // Generate the redirect URL based on environment
    let redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('Using redirect URL:', redirectUrl);
    
    // For sandboxed environments, open in a new window instead of redirecting
    // since iframe navigation to external domains might be blocked
    const oauthUrl = `${api.defaults.baseURL}/square/oauth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    console.log(`Square OAuth URL: ${oauthUrl}`);
    
    if (isInIframe) {
      console.log('In iframe, opening in new window for sandbox environments');
      // Open in a new window for better sandbox compatibility
      window.open(oauthUrl, 'squareOAuth', 'width=800,height=800');
      
      // Return early, we won't redirect the current page
      return true;
    } else {
      console.log('Not in iframe, redirecting current window');
      // Direct navigation for non-iframe contexts
      window.location.href = oauthUrl;
    }

    return true;
  } catch (error) {
    console.error('Error initiating Square OAuth:', error);
    throw error;
  }
};

// Merchant info APIs
export const getMerchantInfo = async () => {
  try {
    console.log('Fetching merchant info from:', `${api.defaults.baseURL}/square/seller/info`);
    const response = await api.get('/square/seller/info');
    console.log('Merchant info response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching merchant info:', error);
    throw error;
  }
};
