/**
 * Comments API Client
 * Handles all comment-related HTTP requests to the backend
 */

// Use empty string when proxy is configured in package.json
// React dev server will proxy requests to http://98.66.152.246
const API_BASE_URL = '';

/**
 * Generic fetch wrapper for API calls
 * @param {string} endpoint - API endpoint (e.g., '/comments', '/comments/123')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let tokenHeaders = {};
  try {
    const token = localStorage.getItem('userToken');
    if (token) {
      tokenHeaders = { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    // ignore
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
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== COMMENTS API ====================

export const commentsAPI = {
  /**
   * List all comments (fallback when server-side filter misbehaves)
   * @returns {Promise<Array>} Array of comments
   */
  listAll: () => fetchAPI('/comments'),

  /**
   * Get all comments for a specific post
   * @param {string} postId - Post ID (ObjectId)
   * @returns {Promise<Array>} Array of comments for the post
   */
  getByPostId: (postId) => fetchAPI(`/comments?postId=${postId}`),
  
  /**
   * Get single comment by ID
   * @param {string} id - Comment ID (ObjectId)
   * @returns {Promise<Object>} Comment object
   */
  getById: (id) => fetchAPI(`/comments/${id}`),
  
  /**
   * Get replies to a specific comment (nested comments)
   * @param {string} commentId - Parent comment ID
   * @returns {Promise<Array>} Array of reply comments
   */
  getReplies: (commentId) => fetchAPI(`/comments/${commentId}/replies`),
  
  /**
   * Create new comment on a post
   * @param {string} postId - Post ID
   * @param {object} commentData - Comment data
   * @param {string} commentData.userId - Author user ID (ObjectId)
   * @param {string} commentData.text - Comment text content
   * @param {string} [commentData.parentCommentId] - Parent comment ID for nested replies
   * @returns {Promise<Object>} Created comment
   */
  create: (postId, commentData) => {
    // Backend schema requires: userId, postId, text, createdAt
    const payload = {
      userId: commentData.userId,
      postId: postId,
      text: commentData.text,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      createdAt: new Date().toISOString(),
    };
    
    // Only include parentCommentId if provided
    if (commentData.parentCommentId) {
      payload.parentCommentId = commentData.parentCommentId;
    }
    
    console.log('Creating comment with payload:', payload);
    return fetchAPI(`/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  /**
   * Create a reply to an existing comment (nested comment)
   * @param {string} parentCommentId - Parent comment ID
   * @param {object} replyData - Reply data
   * @param {string} replyData.author - Author username
   * @param {string} replyData.text - Reply text content
   * @returns {Promise<Object>} Created reply
   */
  createReply: (parentCommentId, replyData) => fetchAPI(`/comments/${parentCommentId}/replies`, {
    method: 'POST',
    body: JSON.stringify(replyData),
  }),
  
  /**
   * Update existing comment
   * @param {string} id - Comment ID
   * @param {object} commentData - Updated comment data
   * @returns {Promise<Object>} Updated comment
   */
  update: (id, commentData) => fetchAPI(`/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(commentData),
  }),
  
  /**
   * Delete comment
   * @param {string} id - Comment ID
   * @returns {Promise<void>}
   */
  delete: (id) => fetchAPI(`/comments/${id}`, {
    method: 'DELETE',
  }),

  /**
   * Upvote a comment
   * @param {string} id - Comment ID
   * @returns {Promise<Object>} Updated comment
   */
  upvote: (id) => fetchAPI(`/comments/${id}/upvote`, {
    method: 'POST',
  }),

  /**
   * Downvote a comment
   * @param {string} id - Comment ID
   * @returns {Promise<Object>} Updated comment
   */
  downvote: (id) => fetchAPI(`/comments/${id}/downvote`, {
    method: 'POST',
  }),
};

export default commentsAPI;
