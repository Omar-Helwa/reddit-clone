import { apiFetch } from './shared';

const apiClient = {
	get: (endpoint) => apiFetch(endpoint),

	post: (endpoint, data) =>
		apiFetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(data ?? {}),
		}),

	patch: (endpoint, data) =>
		apiFetch(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data ?? {}),
		}),

	put: (endpoint, data) =>
		apiFetch(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data ?? {}),
		}),

	delete: (endpoint) =>
		apiFetch(endpoint, {
			method: 'DELETE',
		}),
};

export default apiClient;

// // API client for Reddit Clone backend
// // Use empty string to leverage CRA proxy (configured in package.json)
// // The proxy forwards requests to http://98.66.152.246 to avoid CORS issues

// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// /**
//  * Generic fetch wrapper with error handling
//  */
// async function apiFetch(endpoint, options = {}) {
//   const url = `${API_BASE_URL}${endpoint}`;
  
//   const config = {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   };

//   try {
//     const response = await fetch(url, config);
    
//     if (!response.ok) {
//       const error = await response.json().catch(() => ({ error: response.statusText }));
//       throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
//     }

//     // Handle 204 No Content
//     if (response.status === 204) {
//       return null;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error(`API Error (${endpoint}):`, error);
//     throw error;
//   }
// }

// // ============================================================================
// // USERS API
// // ============================================================================

// /**
//  * Fetch all users
//  * @param {Object} params - Query parameters
//  * @param {number} params.limit - Max number of results (default 25, max 100)
//  * @param {number} params.skip - Number of results to skip for pagination
//  * @returns {Promise<{items: Array, count: number, limit: number, skip: number}>}
//  */
// export async function listUsers({ limit = 25, skip = 0 } = {}) {
//   const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
//   return apiFetch(`/users?${params}`);
// }

// /**
//  * Get a single user by ID
//  * @param {string} id - User ID
//  * @returns {Promise<Object>} User object
//  */
// export async function getUser(id) {
//   return apiFetch(`/users/${id}`);
// }

// /**
//  * Login user (find user by username/email and verify password)
//  * Note: This searches all users and validates credentials client-side
//  * In production, use a proper authentication endpoint with hashed passwords
//  * @param {string} usernameOrEmail - Username or email
//  * @param {string} password - Password
//  * @returns {Promise<Object>} User object if credentials match
//  */
// export async function loginUser(usernameOrEmail, password) {
//   // Fetch all users and find matching credentials
//   const response = await listUsers({ limit: 1000 });
//   const users = response.items || [];
  
//   console.log('Login attempt:', { usernameOrEmail, password });
//   console.log('Total users found:', users.length);
  
//   // Trim whitespace and do case-insensitive comparison for email
//   const normalizedInput = usernameOrEmail.trim().toLowerCase();
//   const normalizedPassword = password.trim();
  
//   const user = users.find(u => {
//     const matchUsername = u.username && u.username.trim() === usernameOrEmail.trim();
//     const matchEmail = u.email && u.email.trim().toLowerCase() === normalizedInput;
//     const matchPassword = u.password && u.password.trim() === normalizedPassword;
    
//     console.log('Checking user:', { 
//       username: u.username, 
//       email: u.email, 
//       matchUsername, 
//       matchEmail, 
//       matchPassword 
//     });
    
//     return (matchUsername || matchEmail) && matchPassword;
//   });
  
//   if (!user) {
//     console.error('No matching user found');
//     throw new Error('Invalid username/email or password');
//   }
  
//   console.log('Login successful:', user);
//   return user;
// }

// /**
//  * Create a new user (SIGNUP)
//  * @param {Object} userData - User data
//  * @param {string} userData.username - Username (3-20 characters)
//  * @param {string} userData.email - Email address
//  * @param {string} userData.password - Password (minimum 6 characters)
//  * @param {string} [userData.image] - Profile image URL
//  * @returns {Promise<Object>} Created user with _id
//  */
// export async function createUser(userData) {
//   // Match the working fetch pattern from the MongoDB API
//   const url = `${API_BASE_URL}/users`;
  
//   // Prepare user data - schema expects createdAt as number (timestamp)
//   const payload = {
//     username: userData.username,
//     email: userData.email,
//     password: userData.password,
//     image: userData.image || '',
//     createdAt: Date.now() // Send as timestamp number, not ISO string
//   };
  
//   console.log('Creating user with payload:', payload);
  
//   const response = await fetch(url, {
//     method: 'POST',
//     body: JSON.stringify(payload),
//     redirect: 'follow',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
  
//   if (!response.ok) {
//     const error = await response.text().catch(() => response.statusText);
//     throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
//   }
  
//   const result = await response.json();
//   console.log('User created:', result);
//   return result;
// }

// // Communities API
// export async function listCommunities({ limit = 50, offset = 0 } = {}) {
//   return apiFetch(`/communities?limit=${limit}&offset=${offset}`);
// }

// export async function getCommunity(id) {
//   return apiFetch(`/communities/${id}`);
// }

// export async function createCommunity(data) {
//   const payload = {
//     name: data.name,
//     displayName: data.displayName || data.name,
//     description: data.description || '',
//     icon: data.icon || '',
//     banner: data.banner || '',
//     members: data.members ?? 1,
//     online: data.online ?? 1,
//     createdDate: new Date().toISOString(),
//     type: data.type || 'Public',
//     rules: data.rules || [],
//     moderators: data.moderators || [],
//   };

//   console.log('Creating community:', payload);
//   return apiFetch('/communities', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   });
// }

// /**
//  * Update an existing community
//  * @param {string} id - Community ID (MongoDB ObjectId)
//  * @param {Object} data - Fields to update
//  * @returns {Promise<Object>} Updated community
//  */
// export async function updateCommunity(id, data) {
//   return apiFetch(`/communities/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(data),
//   });
// }

// /**
//  * Delete a community
//  * @param {string} id - Community ID (MongoDB ObjectId)
//  * @returns {Promise<Object>} Deleted community
//  */
// export async function deleteCommunity(id) {
//   return apiFetch(`/communities/${id}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Update a user (partial update)
//  * @param {string} id - User ID
//  * @param {Object} updates - Fields to update
//  * @returns {Promise<Object>} Updated user
//  */
// export async function updateUser(id, updates) {
//   return apiFetch(`/users/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(updates),
//   });
// }

// /**
//  * Delete a user (DELETE ACCOUNT)
//  * @param {string} id - User ID
//  * @returns {Promise<null>}
//  */
// export async function deleteUser(id) {
//   return apiFetch(`/users/${id}`, {
//     method: 'DELETE',
//   });
// }

// // ============================================================================
// // POSTS API (placeholder - add posts schema to backend first)
// // ============================================================================


// // ============================================================================
// // COMMENTS API (placeholder - add comments schema to backend first)
// // ============================================================================

// // ============================================================================
// // HEALTH CHECK
// // ============================================================================

// export async function checkHealth() {
//   return apiFetch('/health');
// }

// // ============================================================================
// // SCHEMAS INTROSPECTION
// // ============================================================================

// export async function listSchemas() {
//   return apiFetch('/schemas');
// }
