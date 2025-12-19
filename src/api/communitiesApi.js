// Communities API client
import { apiFetch, API_BASE_URL } from './shared.js';

/**
 * Fetch all communities
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max number of results (default 25, max 100)
 * @param {number} params.skip - Number of results to skip for pagination
 * @returns {Promise<{items: Array, count: number, limit: number, skip: number}>}
 */
export async function listCommunities({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/communities?${params}`);
}

/**
 * Get a single community by ID
 * @param {string} id - Community ID
 * @returns {Promise<Object>} Community object
 */
export async function getCommunity(id) {
  return apiFetch(`/communities/${id}`);
}

/**
 * Create a new community
 * @param {Object} communityData - Community data
 * @param {string} communityData.name - Community name (lowercased URL-friendly name)
 * @param {string} communityData.displayName - Display name for the community
 * @param {string} communityData.description - Community description
 * @param {string} [communityData.icon] - Community icon URL
 * @param {string} [communityData.banner] - Community banner URL
 * @param {Array} [communityData.members] - Initial members array
 * @param {number} [communityData.online] - Number of online members (default 0)
 * @param {string} [communityData.type] - Community type (e.g., 'Public', 'Private')
 * @param {Array} [communityData.rules] - Community rules array
 * @param {Array} [communityData.moderators] - Community moderators array
 * @returns {Promise<Object>} Created community with _id
 */
export async function createCommunity(communityData) {
  // Match the working fetch pattern from the MongoDB API
  const url = `${API_BASE_URL}/communities`;
  
  // Prepare community data
  const payload = {
    name: communityData.name,
    displayName: communityData.displayName,
    description: communityData.description,
    icon: communityData.icon || '',
    banner: communityData.banner || '',
    members: communityData.members || [],
    online: communityData.online || 0,
    type: communityData.type || 'Public',
    rules: communityData.rules || [],
    moderators: communityData.moderators || [],
    createdDate: new Date().toISOString()
  };
  
  // Get token for authorization
  let authHeaders = {};
  try {
    const token = localStorage.getItem('userToken');
    if (token) {
      authHeaders = { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    // ignore
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
  
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
}

/**
 * Update a community (partial update)
 * @param {string} id - Community ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated community
 */
export async function updateCommunity(id, updates) {
  return apiFetch(`/communities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a community
 * @param {string} id - Community ID
 * @returns {Promise<null>}
 */
export async function deleteCommunity(id) {
  return apiFetch(`/communities/${id}`, {
    method: 'DELETE',
  });
}
