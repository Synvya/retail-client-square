
import api from './core';

// Merchant profile APIs
export const getMerchantProfile = async () => {
  try {
    console.log('Fetching merchant profile from:', `${api.defaults.baseURL}/square/profile`);
    const response = await api.get('/square/profile');
    console.log('Profile response status:', response.status);
    console.log('Profile response data type:', typeof response.data);
    console.log('Profile response data:', JSON.stringify(response.data, null, 2));

    // Add validation for expected structure
    if (response.data && !response.data.public_key) {
      console.warn('Warning: The merchant profile does not contain a public_key field:', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    throw error;
  }
};

export const updateMerchantProfile = async (profileData: any) => {
  try {
    console.log('Updating merchant profile with data:', JSON.stringify(profileData, null, 2));
    console.log('Request URL:', `${api.defaults.baseURL}/square/profile/publish`);
    const response = await api.post('/square/profile/publish', profileData);
    console.log('Update response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error updating merchant profile:', error);
    throw error;
  }
};
