
import api from './core';

// Update the Square OAuth endpoint with improved redirect handling
export const initiateSquareOAuth = async () => {
  try {
    // Get the current host from the URL
    const currentHost = window.location.host;
    const protocol = window.location.protocol;

    // Check if we're in the Lovable preview iframe
    const isLovablePreview = currentHost.includes('lovableproject.com') &&
      window.location !== window.parent.location;

    console.log('OAuth initialization details:', {
      currentHost,
      protocol,
      isInIframe: window.location !== window.parent.location,
      isLovablePreview
    });

    // Generate the redirect URL based on environment
    let redirectUrl;
    if (isLovablePreview) {
      // If in preview, use the parent window's location to avoid iframe issues
      redirectUrl = `${protocol}//${currentHost}/auth/callback`;
      console.log('Using preview redirect URL:', redirectUrl);
    } else {
      // For standalone browser windows, use standard redirect
      redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Using standard redirect URL:', redirectUrl);
    }

    // Using the exact parameter name expected by the backend: redirect_uri
    const oauthUrl = `${api.defaults.baseURL}/square/oauth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);

    // Open in current window - this works better for OAuth flows
    window.location.href = oauthUrl;

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
