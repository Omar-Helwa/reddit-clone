import { apiFetch } from './shared';

/**
 * Use shared apiFetch for consistent error handling and auth tokens
 */

/**
 * Chat API Module
 * Handles all chat-related API requests
 */

/**
 * Fetch all chats for the current user
 * @returns {Promise<Array>} List of chat conversations
 */
export const fetchChats = async () => {
  try {
    console.log('🔄 Calling GET /chats');
    const response = await apiFetch('/chats');
    console.log('✅ GET /chats response:', response);
    // Backend returns paginated response: { items: [...], count, limit, skip }
    const items = response?.items || response;
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    throw error;
  }
};

export const fetchChatsForUser = async (userId) => {
  const id = String(userId || '').trim();
  const qs = id ? `?userId=${encodeURIComponent(id)}` : '';
  console.log('🔄 Calling GET /chats with userId:', id);
  const response = await apiFetch(`/chats${qs}`);
  console.log('✅ GET /chats response for user:', response);
  // Backend returns paginated response: { items: [...], count, limit, skip }
  const items = response?.items || response;
  return Array.isArray(items) ? items : [];
};

/**
 * Fetch a specific chat by ID
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Chat details
 */
export const fetchChatById = async (chatId) => {
  try {
    const response = await apiFetch(`/chats/${chatId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Create a new chat conversation
 * @param {Object} chatData - Chat data (user1, user2, or participants array)
 * @returns {Promise<Object>} Created chat
 */
export const createChat = async (chatData) => {
  try {
    const response = await apiFetch('/chats', {
      method: 'POST',
      body: JSON.stringify(chatData ?? {}),
    });
    return response;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Send a message in a chat
 * @param {string} chatId - The chat ID
 * @param {Object} messageData - Message content (content, userId, attachments, replyTo)
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (chatId, messageData) => {
  try {
    // Build payload: omit replyTo if null/undefined (backend rejects null)
    const payload = {
      content: messageData.content ?? '',
      userId: messageData.userId,
      timestamp: messageData.timestamp,
      attachments: messageData.attachments ?? [],
    };
    if (messageData.replyTo) {
      payload.replyTo = messageData.replyTo;
    }

    const response = await apiFetch(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Fetch all messages for a specific chat
 * @param {string} chatId - The chat ID
 * @returns {Promise<Array>} List of messages
 */
export const fetchChatMessages = async (chatId) => {
  try {
    console.log('🔄 Calling GET /chats/:id/messages for chatId:', chatId);
    const response = await apiFetch(`/chats/${chatId}/messages`);
    console.log('✅ GET messages response:', response);
    // Backend returns paginated response: { items: [...], count, limit, skip }
    const items = response?.items || response;
    console.log('📨 Extracted messages:', items, 'count:', Array.isArray(items) ? items.length : 0);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Delete a chat conversation
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteChat = async (chatId) => {
  try {
    const response = await apiFetch(`/chats/${chatId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Delete a single message in a chat
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{success: boolean}>}
 */
export const deleteMessage = async (chatId, messageId) => {
  try {
    const response = await apiFetch(`/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error(`Error deleting message ${messageId} in chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Search chats by user name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered chats
 */
export const searchChats = async (query) => {
  try {
    console.log('🔄 Calling GET /chats/search with query:', query);
    const response = await apiFetch(`/chats/search?q=${encodeURIComponent(query)}`);
    console.log('✅ GET /chats/search response:', response);
    // Backend returns paginated response: { items: [...], count, limit, skip }
    const items = response?.items || response;
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Error searching chats:', error);
    throw error;
  }
};

/**
 * Mark chat as read
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Updated chat
 */
export const markChatAsRead = async (chatId) => {
  try {
    const response = await apiFetch(`/chats/${chatId}/read`, { method: 'PATCH' });
    return response;
  } catch (error) {
    console.error(`Error marking chat ${chatId} as read:`, error);
    throw error;
  }
};

export default {
  fetchChats,
  fetchChatById,
  createChat,
  sendMessage,
  fetchChatMessages,
  deleteChat,
  deleteMessage,
  searchChats,
  markChatAsRead,
};
