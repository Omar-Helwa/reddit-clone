// Users API client
import { apiFetch, API_BASE_URL } from './shared.js';

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
  console.log('Auth login URL:', url, 'payload:', payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Login failed response:', response.status, text);
    let parsed = {};
    try { parsed = JSON.parse(text); } catch (e) {}
    throw new Error(parsed.error || parsed.message || text || `HTTP ${response.status}`);
  }

  const result = await response.json();
  // Expect backend to return { user: {...}, token: '...' }
  console.log('Login success payload keys:', Object.keys(result || {}));
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
  
  console.log('Creating user with payload:', payload);
  
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
  console.log('User created:', result);
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
