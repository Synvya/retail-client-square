
import api from './core';

// Locations API
export const publishLocations = async () => {
  try {
    console.log('Publishing merchant locations');
    const response = await api.post('/square/locations/publish');
    
    // Enhanced logging of the exact response structure
    console.log('Locations publish response status:', response.status);
    console.log('Locations publish response data:', JSON.stringify(response.data, null, 2));
    
    // Improved success detection logic
    const isSuccess = response.status >= 200 && response.status < 300;
    
    // If the API returns a success field, use that; otherwise, use HTTP status-based success
    const result = {
      success: response.data?.success !== undefined ? response.data.success : isSuccess,
      data: response.data
    };
    
    console.log('Interpreted result:', result);
    return result;
  } catch (error) {
    console.error('Error publishing locations:', error);
    // Return consistent structure even in the error case, with data property
    return { 
      success: false, 
      data: { message: 'Failed to connect to the server' },
      error: error 
    };
  }
};

// Products API
export const publishProducts = async () => {
  try {
    console.log('Publishing merchant products catalog');
    const response = await api.post('/square/catalog/publish');
    
    // Enhanced logging of the exact response structure
    console.log('Catalog publish response status:', response.status);
    console.log('Catalog publish response data:', JSON.stringify(response.data, null, 2));
    
    // Improved success detection logic
    const isSuccess = response.status >= 200 && response.status < 300;
    
    // If the API returns a success field, use that; otherwise, use HTTP status-based success
    const result = {
      success: response.data?.success !== undefined ? response.data.success : isSuccess,
      data: response.data
    };
    
    console.log('Interpreted result:', result);
    return result;
  } catch (error) {
    console.error('Error publishing products catalog:', error);
    // Return consistent structure even in the error case, with data property
    return { 
      success: false, 
      data: { message: 'Failed to connect to the server' },
      error: error 
    };
  }
};
