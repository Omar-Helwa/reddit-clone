// ==================== AUTHENTICATED USER DATA ENDPOINTS ====================
import { apiFetch, API_BASE_URL } from './shared.js';
import { getCurrentUserId } from '../utils/auth.js';

/**
 * Get all posts saved by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMySavedPosts({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/saved-posts?${params}`);
}

/**
 * Get all comments written by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyComments({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/comments?${params}`);
}

/**
 * Get all posts hidden by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyHiddenPosts({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/hidden-posts?${params}`);
}

/**
 * Get all posts upvoted by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyUpvotedPosts({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/upvoted-posts?${params}`);
}

/**
 * Get all posts downvoted by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyDownvotedPosts({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/downvoted-posts?${params}`);
}

/**
 * Get all posts created by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyPosts({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/posts?${params}`);
}

/**
 * Get personalized feed for the authenticated user (excluding hidden posts)
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyFeed({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/feed?${params}`);
}

/**
 * Get the list of users the authenticated user is following
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyFollowing({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/following?${params}`);
}

/**
 * Get the list of users following the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyFollowers({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/followers?${params}`);
}
// Users API client


/**
 * Fetch all users
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max number of results (default 25, max 100)
 * @param {number} params.skip - Number of results to skip for pagination
 * @returns {Promise<{items: Array, count: number, limit: number, skip: number}>}
 */
export async function listUsers({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users?${params}`);
}

/**
 * Search users by username
 * @param {string} query - Search query (username)
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max number of results (default 25)
 * @returns {Promise<Array>} Array of matching users
 */
export async function searchUsers(query, { limit = 25 } = {}) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  try {
    const result = await apiFetch(`/users/search?${params}`);
    return result.items || result || [];
  } catch (err) {
    // Fallback: fetch all users and filter client-side if search endpoint doesn't exist
    try {
      const all = await listUsers({ limit: 100 });
      const users = all.items || all || [];
      return users.filter(u => 
        u.username?.toLowerCase().includes(query.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(query.toLowerCase())
      );
    } catch {
      return [];
    }
  }
}

/**
 * Get a single user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUser(id) {
  return apiFetch(`/users/${id}`);
}

/**
 * Login user against auth endpoint, expect JWT token
 * @param {string} usernameOrEmail - Username or email
 * @param {string} password - Password
 * @returns {Promise<Object>} { user, token }
 */
export async function loginUser(usernameOrEmail, password) {
  const trimmedUser = (usernameOrEmail || '').trim();
  const trimmedPass = (password || '').trim();

  if (!trimmedUser || !trimmedPass) {
    throw new Error('Username/email and password are required');
  }

  // Send only username + password (backend requires these two)
  const payload = {
    username: trimmedUser,
    password: trimmedPass,
  };

  const url = `${API_BASE_URL}/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let parsed = {};
    try { parsed = JSON.parse(text); } catch (e) {}
    throw new Error(parsed.error || parsed.message || text || `HTTP ${response.status}`);
  }

  const result = await response.json();
  // Expect backend to return { user: {...}, token: '...' }
  if (result?.token) {
    return result;
  }

  // Fallback: if token not provided but user returned
  return { user: result, token: result?.token };
}

/**
 * Create a new user (SIGNUP)
 * @param {Object} userData - User data
 * @param {string} userData.username - Username (3-20 characters)
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password (minimum 6 characters)
 * @param {string} [userData.image] - Profile image URL
 * @returns {Promise<Object>} Created user with _id
 */
export async function createUser(userData) {
  // Match the working fetch pattern from the MongoDB API
  const url = `${API_BASE_URL}/users`;
  
  // Prepare user data - schema expects createdAt as number (timestamp)
  const payload = {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    image: userData.image || '',
    createdAt: Date.now() // Send as timestamp number, not ISO string
  };
  
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/json',
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
 * Update a user (partial update)
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(id, updates) {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a user (DELETE ACCOUNT)
 * @param {string} id - User ID
 * @returns {Promise<null>}
 */
export async function deleteUser(id) {
  return apiFetch(`/users/${id}`, {
    method: 'DELETE',
  });
}

// ==================== USER SETTINGS ENDPOINTS ====================

/**
 * Toggle NSFW content preference for authenticated user
 * @param {boolean} nsfw - NSFW preference
 * @returns {Promise<Object>} Updated user object
 */
export async function toggleNsfw(nsfw) {
  return apiFetch('/users/me/nsfw', {
    method: 'PATCH',
    body: JSON.stringify({ nsfw }),
  });
}

/**
 * Toggle whether the user allows others to follow them
 * @param {boolean} allowFollowing - Allow following preference
 * @returns {Promise<Object>} Updated user object
 */
export async function toggleAllowFollow(allowFollowing) {
  return apiFetch('/users/me/allow-follow', {
    method: 'PATCH',
    body: JSON.stringify({ allowFollowing }),
  });
}

/**
 * Update user's email address
 * @param {string} email - New email address
 * @returns {Promise<Object>} Updated user object
 */
export async function updateEmail(email) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  return updateUser(userId, { email });
}

/**
 * Update user's password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user object
 */
export async function updatePassword(newPassword) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  return updateUser(userId, { password: newPassword });
}

/**
 * Update user's social links
 * @param {Object} socialLinks - Social links object (e.g., { twitter: 'url', facebook: 'url' })
 * @returns {Promise<Object>} Updated user object
 */
export async function updateSocialLinks(socialLinks) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  return updateUser(userId, { socialLinks });
}

// ==================== USER SOCIAL ENDPOINTS ====================

/**
 * Block another user
 * Blocking removes any existing follow relationships in both directions
 * @param {string} userId - Target user's ID to block
 * @returns {Promise<Object>} Authenticated user object with updated blockedUsers array
 */
export async function blockUser(userId) {
  return apiFetch(`/users/${userId}/block`, {
    method: 'POST',
  });
}

/**
 * Unblock a previously blocked user
 * @param {string} userId - Target user's ID to unblock
 * @returns {Promise<Object>} Authenticated user object with updated blockedUsers array
 */
export async function unblockUser(userId) {
  return apiFetch(`/users/${userId}/block`, {
    method: 'DELETE',
  });
}

/**
 * Get list of users blocked by the authenticated user
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getMyBlockedUsers({ limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/me/blocked?${params}`);
}

/**
 * Report a user for violations
 * @param {string} userId - Target user's ID to report
 * @param {Object} reportData - Report details
 * @param {string} reportData.reason - Reason for the report
 * @param {string} [reportData.description] - Additional details
 * @returns {Promise<Object>} Report confirmation
 */
export async function reportUser(userId, reportData) {
  return apiFetch(`/users/${userId}/report`, {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
}

/**
 * Follow another user
 * The target user must allow followers
 * @param {string} userId - Target user's ID to follow
 * @returns {Promise<Object>} Target user object with updated followers
 */
export async function followUser(userId) {
  return apiFetch(`/users/${userId}/follow`, {
    method: 'POST',
  });
}

/**
 * Unfollow a previously followed user
 * @param {string} userId - Target user's ID to unfollow
 * @returns {Promise<Object>} Target user object with updated followers
 */
export async function unfollowUser(userId) {
  return apiFetch(`/users/${userId}/follow`, {
    method: 'DELETE',
  });
}
/**
 * Get all posts created by a specific user (public data)
 * @param {string} userId - Target user's ID
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getUserPosts(userId, { limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/${userId}/posts?${params}`);
}

/**
 * Get all comments written by a specific user (public data)
 * @param {string} userId - Target user's ID
 * @param {Object} params - Query params: limit, skip
 * @returns {Promise<Object>} { items, count, limit, skip }
 */
export async function getUserComments(userId, { limit = 25, skip = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  return apiFetch(`/users/${userId}/comments?${params}`);
}