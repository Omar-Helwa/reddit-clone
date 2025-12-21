/**
 * Image Upload API
 * 
 * Two-step upload process:
 * 1. Upload image file to /api/uploads -> Get URL
 * 2. Use returned URL in create/update operations
 */

import { API_BASE_URL } from './shared';

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @param {string} folder - Target folder: 'users', 'posts', 'communities', or 'general'
 * @returns {Promise<{success: boolean, url: string, filename: string, originalName: string, size: number, mimeType: string, folder: string}>}
 */
export async function uploadImage(file, folder = 'general') {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Get auth token
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // Upload - DO NOT set Content-Type header, browser sets it with boundary
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Upload failed: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete an uploaded image
 * @param {string} folder - The folder containing the image
 * @param {string} filename - The filename to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(folder, filename) {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/uploads/${folder}/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Delete failed: HTTP ${response.status}`);
  }
}

/**
 * Upload image for user profile
 * @param {File} file - Image file
 * @returns {Promise<string>} The uploaded image URL
 */
export async function uploadProfileImage(file) {
  const result = await uploadImage(file, 'users');
  return result.url;
}

/**
 * Upload image for a post
 * @param {File} file - Image file
 * @returns {Promise<string>} The uploaded image URL
 */
export async function uploadPostImage(file) {
  const result = await uploadImage(file, 'posts');
  return result.url;
}

/**
 * Upload community icon or banner
 * @param {File} file - Image file
 * @returns {Promise<string>} The uploaded image URL
 */
export async function uploadCommunityImage(file) {
  const result = await uploadImage(file, 'communities');
  return result.url;
}

export default {
  uploadImage,
  deleteImage,
  uploadProfileImage,
  uploadPostImage,
  uploadCommunityImage,
};
