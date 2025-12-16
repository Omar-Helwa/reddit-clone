/**
 * Posts API Client
 * Handles all POST-related HTTP requests to the backend
 */


// Use empty string when proxy is configured in package.json
// React dev server will proxy requests to http://98.66.152.246
const API_BASE_URL = '';

/**
 * Generic fetch wrapper for API calls
 * @param {string} endpoint - API endpoint (e.g., '/posts', '/posts/123')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach bearer token if available
  let tokenHeaders = {};
  try {
    const token = localStorage.getItem('userToken');
    const envToken = process.env.REACT_APP_API_TOKEN;
    const bearer = token || envToken;
    if (bearer) {
      tokenHeaders = { Authorization: `Bearer ${bearer}` };
    }
  } catch (e) {
    // localStorage might be unavailable; ignore
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== POSTS API ====================

export const postsAPI = {
  /**
   * Get all posts
   * @returns {Promise<Array>} Array of posts
   */
  getAll: () => fetchAPI('/posts'),
  
  /**
   * Get posts by subreddit/community
   * @param {string} subreddit - Subreddit name (e.g., 'r/hackthebox')
   * @returns {Promise<Array>} Array of posts from the community
   */
  getBySubreddit: (subreddit) => fetchAPI(`/posts?subreddit=${encodeURIComponent(subreddit)}`),
  
  /**
   * Get single post by ID
   * @param {string} id - Post ID (ObjectId)
   * @returns {Promise<Object>} Post object
   */
  getById: (id) => fetchAPI(`/posts/${id}`),
  
  /**
   * Create new post
   * @param {object} postData - Post data
   * @param {string} postData.title - Post title
   * @param {string} postData.author - Author username
   * @param {string} postData.subreddit - Subreddit name
   * @param {string} postData.type - 'text' | 'link' | 'image' | 'poll'
   * @param {string} [postData.textBody] - Body text (for text posts)
   * @param {string} [postData.linkUrl] - URL (for link posts)
   * @param {string} [postData.imageUrl] - Image URL (for image posts)
   * @param {Array} [postData.pollOptions] - Poll options (for poll posts)
   * @returns {Promise<Object>} Created post
   */
  create: (postData) => fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
  
  /**
   * Update existing post
   * @param {string} id - Post ID
   * @param {object} postData - Updated post data (partial)
   * @returns {Promise<Object>} Updated post
   */
  update: (id, postData) => fetchAPI(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  }),
  
  /**
   * Delete post
   * @param {string} id - Post ID
   * @returns {Promise<void>}
   */
  delete: (id) => fetchAPI(`/posts/${id}`, {
    method: 'DELETE',
  }),

  /**
   * Upvote a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Updated post
   */
  upvote: (id) => fetchAPI(`/posts/${id}/upvote`, {
    method: 'POST',
  }),

  /**
   * Downvote a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Updated post
   */
  downvote: (id) => fetchAPI(`/posts/${id}/downvote`, {
    method: 'POST',
  }),

  /**
   * Pin a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Updated post
   */
  pin: (id) => fetchAPI(`/posts/${id}/pin`, {
    method: 'POST',
  }),

  /**
   * Unpin a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Updated post
   */
  unpin: (id) => fetchAPI(`/posts/${id}/unpin`, {
    method: 'POST',
  }),
};

export default postsAPI;
