// Утилита для работы с API
import { getApiUrl } from '../config/api.js';

export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });
export const apiPost = (endpoint, data) => apiRequest(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(data) 
});
export const apiPut = (endpoint, data) => apiRequest(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(data) 
});
export const apiPatch = (endpoint, data) => apiRequest(endpoint, { 
  method: 'PATCH', 
  body: JSON.stringify(data) 
});
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });
