/**
 * Notifications system and management
 */

const NOTIFICATIONS_KEY = 'app-notifications';
const MAX_NOTIFICATIONS = 50;

/**
 * Get all notifications
 */
export function getNotifications() {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add a notification
 * @param {Object} notification
 * @param {string} notification.id - Unique ID
 * @param {string} notification.type - 'upvote' | 'comment' | 'follow' | 'join' | 'message'
 * @param {string} notification.title - Display title
 * @param {string} notification.message - Notification message
 * @param {string} [notification.link] - URL to navigate to
 * @param {string} [notification.avatar] - Avatar URL
 * @param {number} [notification.timestamp] - Unix timestamp
 */
export function addNotification(notification) {
  const notifications = getNotifications();
  const newNotification = {
    id: notification.id || `notif-${Date.now()}`,
    type: notification.type || 'default',
    title: notification.title,
    message: notification.message,
    link: notification.link || null,
    avatar: notification.avatar || null,
    timestamp: notification.timestamp || Date.now(),
    read: false
  };
  
  notifications.unshift(newNotification);
  
  // Keep only recent notifications
  const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  
  return newNotification;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId) {
  const notifications = getNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Mark all as read
 */
export function markAllAsRead() {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

/**
 * Get unread count
 */
export function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length;
}

/**
 * Example notifications for demo
 */
export function addSampleNotifications() {
  const notifications = getNotifications();
  if (notifications.length > 0) return; // Don't add if some exist
  
  addNotification({
    type: 'upvote',
    title: 'Your post got popular!',
    message: 'Your post "Learning React in 2025" received 500 upvotes',
    link: '/r/programming/comments/example',
    timestamp: Date.now() - 1000 * 60 * 30
  });
  
  addNotification({
    type: 'comment',
    title: 'New comment on your post',
    message: 'u/johndoe commented: "Great tutorial!"',
    link: '/r/programming/comments/example',
    timestamp: Date.now() - 1000 * 60 * 60
  });
  
  addNotification({
    type: 'follow',
    title: 'New follower!',
    message: 'u/sarah_tech started following you',
    avatar: 'https://via.placeholder.com/40',
    link: '/user/sarah_tech',
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  });
  
  addNotification({
    type: 'join',
    title: 'Member joined your community',
    message: '5 new members joined r/mynewcommunity',
    link: '/r/mynewcommunity',
    timestamp: Date.now() - 1000 * 60 * 60 * 3
  });
  
  addNotification({
    type: 'message',
    title: 'New message from u/alex_dev',
    message: 'Hey! Want to collaborate on a project?',
    link: '/chats',
    timestamp: Date.now() - 1000 * 60 * 60 * 4
  });
}
