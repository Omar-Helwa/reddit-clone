// Shared API utilities
// Use empty string to leverage CRA proxy (configured in package.json)
// The proxy forwards requests to http://98.66.152.246 to avoid CORS issues

export const API_BASE_URL = "/api";

/**
 * Generic fetch wrapper with error handling
 * Authorization token is only sent for non-GET requests (POST, PUT, PATCH, DELETE)
 */

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let tokenHeaders = {};
  try {
    const token = localStorage.getItem('userToken');
    if (token) {
      tokenHeaders = { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    // ignore if localStorage unavailable
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...tokenHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}
