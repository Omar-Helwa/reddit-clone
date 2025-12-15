/*
 * DEPRECATED: This file has been split into separate API modules
 * Use instead:
 * - src/api/postsAPI.js (for post operations)
 * - src/api/commentsAPI.js (for comment operations)
 * 
 * This file is kept for reference only.
 */

/*
// Backend API base URL
const API_BASE_URL = 'http://98.66.152.246';

// Generic fetch wrapper for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== POSTS API ====================

export const postsAPI = {
  getAll: () => fetchAPI('/posts'),
  getById: (id) => fetchAPI(`/posts/${id}`),
  create: (postData) => fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
  update: (id, postData) => fetchAPI(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  }),
  delete: (id) => fetchAPI(`/posts/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== COMMUNITIES API ====================

export const communitiesAPI = {
  getAll: () => fetchAPI('/communities'),
  getById: (id) => fetchAPI(`/communities/${id}`),
  create: (data) => fetchAPI('/communities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/communities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/communities/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== COMMENTS API ====================

export const commentsAPI = {
  getByPostId: (postId) => fetchAPI(`/posts/${postId}/comments`),
  create: (postId, commentData) => fetchAPI(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),
  update: (commentId, data) => fetchAPI(`/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (commentId) => fetchAPI(`/comments/${commentId}`, {
    method: 'DELETE',
  }),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () => fetchAPI('/health');

// Default export
export default {
  postsAPI,
  communitiesAPI,
  commentsAPI,
  healthCheck,
};
*/
