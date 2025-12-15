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
  if (user && user._id) {
    localStorage.setItem('userId', user._id);
    localStorage.setItem('username', user.username);
    localStorage.setItem('userEmail', user.email);
    if (user.image) {
      localStorage.setItem('userImage', user.image);
    }
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
    username: localStorage.getItem('username'),
    email: localStorage.getItem('userEmail'),
    image: localStorage.getItem('userImage'),
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
