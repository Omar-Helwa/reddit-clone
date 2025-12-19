// User Authentication Helper
// Store and retrieve logged-in user information

/**
 * Save user info after successful login/signup
 * @param {Object} user - User object from API
 * @param {string} user._id - User ID
 * @param {string} user.username - Username
 * @param {string} user.email - Email
 */
export function setCurrentUser(user) {
  const userId = user?._id || user?.id;
  if (userId) {
    localStorage.setItem('userId', userId);
    if (user?.username != null) {
      localStorage.setItem('username', user.username);
    }
    const email = user?.email ?? user?.ema;
    if (email != null) {
      localStorage.setItem('userEmail', email);
    }
    if (user?.image) {
      localStorage.setItem('userImage', user.image);
    }
  }

  if (user && user.token) {
    localStorage.setItem('userToken', user.token);
  }
}

/**
 * Get currently logged-in user info
 * @returns {Object|null} User info or null if not logged in
 */
export function getCurrentUser() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    return null;
  }
  
  return {
    _id: userId,
    id: userId,
    username: localStorage.getItem('username'),
    email: localStorage.getItem('userEmail'),
    image: localStorage.getItem('userImage'),
    token: localStorage.getItem('userToken'),
  };
}

/**
 * Get current user ID
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
  return localStorage.getItem('userId');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!localStorage.getItem('userId');
}

/**
 * Clear user data (logout)
 */
export function clearCurrentUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userImage');
  localStorage.removeItem('userToken');
}

/**
 * Get stored JWT token
 * @returns {string|null}
 */
export function getUserToken() {
  return localStorage.getItem('userToken');
}

/**
 * Update user info in local storage
 * @param {Object} updates - Fields to update
 */
export function updateCurrentUser(updates) {
  if (updates.username) {
    localStorage.setItem('username', updates.username);
  }
  if (updates.email) {
    localStorage.setItem('userEmail', updates.email);
  }
  if (updates.image !== undefined) {
    if (updates.image) {
      localStorage.setItem('userImage', updates.image);
    } else {
      localStorage.removeItem('userImage');
    }
  }
}
