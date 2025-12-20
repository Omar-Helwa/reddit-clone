import React, { useEffect, useState } from 'react';
import { useMyProfileData } from '../hooks/useMyProfileData';
import './ProfilePage.css';
import { getCurrentUser, getCurrentUserId, getAvatarSettings } from '../utils/auth';
import { 
  getUser, 
  followUser, 
  unfollowUser
} from '../api/usersApi';
import CommunityList from '../features/communities/CommunityList';
import Post from '../features/posts/Post';
import { navigate } from '../utils/helpers';
import postsAPI from '../api/postsAPI';
import commentsAPI from '../api/commentsAPI';
import { createChat, fetchChats } from '../api/chatsApi';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';

// Helper function to format time ago
const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} yr. ago`;
  if (diffMonths > 0) return `${diffMonths} mo. ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hr. ago`;
  if (diffMins > 0) return `${diffMins} min. ago`;
  return 'just now';
};

// Profile Comment Card Component
function ProfileCommentCard({ comment, username }) {
  const [score, setScore] = useState(comment.score || 0);
  const [voted, setVoted] = useState(null);

  const handleVote = (direction) => {
    if (voted === direction) {
      setVoted(null);
      setScore(comment.score || 0);
    } else {
      setVoted(direction);
      setScore((comment.score || 0) + (direction === 'up' ? 1 : -1));
    }
  };

  const handleCommentClick = () => {
    if (comment.postId) {
      navigate(`/r/${comment.subreddit || 'unknown'}/comments/${comment.postId}`);
    }
  };

  return (
    <div className="profile-comment-card">
      <div className="comment-card-header">
        <div className="comment-card-community" onClick={() => navigate(`/r/${comment.subreddit || 'unknown'}`)}>
          <img 
            src={DEFAULT_COMMUNITY_ICON} 
            alt="" 
            className="comment-community-icon"
            onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
          />
          <span className="comment-community-name">r/{comment.subreddit || 'unknown'}</span>
        </div>
        <span className="comment-card-dot">•</span>
        <span className="comment-card-post-title" onClick={handleCommentClick}>
          {comment.postTitle || 'Post'}
        </span>
      </div>
      
      <div className="comment-card-meta">
        <span className="comment-card-author">{username || comment.author || 'unknown'}</span>
        <span className="comment-card-action">
          {comment.parentId ? 'replied to' : 'commented'}
        </span>
        {comment.parentAuthor && (
          <span className="comment-card-parent-author">{comment.parentAuthor}</span>
        )}
        <span className="comment-card-time">{formatTimeAgo(comment.createdAt)}</span>
      </div>

      <div className="comment-card-text" onClick={handleCommentClick}>
        {comment.text}
      </div>

      <div className="comment-card-actions">
        <button 
          className={`comment-vote-btn ${voted === 'up' ? 'voted-up' : ''}`}
          onClick={() => handleVote('up')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
        </button>
        <span className={`comment-score ${voted === 'up' ? 'score-up' : voted === 'down' ? 'score-down' : ''}`}>
          {score}
        </span>
        <button 
          className={`comment-vote-btn ${voted === 'down' ? 'voted-down' : ''}`}
          onClick={() => handleVote('down')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 20l8-8h-5V4H9v8H4z"/>
          </svg>
        </button>
        <button className="comment-action-btn" onClick={handleCommentClick}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M21 6h-2V3H5v3H3c-1 0-2 1-2 2v3c0 3 2 5.5 5 6.4V19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-1.6c3-.9 5-3.4 5-6.4V8c0-1-1-2-2-2zM3 8h2v3c0 1.5.5 2.8 1.4 3.9C4.2 14 3 12.2 3 10V8zm14 11H7v-1h10v1zm4-9c0 2.2-1.2 4-3.4 4.9-.4-.2-.9-.4-1.6-.6V11h-2v4H10v-4H8v3.3c-.7.2-1.2.4-1.6.6C5.2 14 4 12.2 4 10V8h16v2z"/>
          </svg>
          Reply
        </button>
        <button className="comment-action-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.7 8 6.5 9.4l-.4-2.1C5.8 18 4 15.2 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.2-1.8 6-4.5 7.3l-.5 2.1C18.3 20 21 16.3 21 12c0-5.5-4.5-10-10-10zm.5 13.5l3.5-3.5-1.5-1.5-1 1V8h-2v3.5l-1-1L9 12l3.5 3.5z"/>
          </svg>
          Share
        </button>
        <button className="comment-action-btn comment-more-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M6 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [viewedUserId, setViewedUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [avatarSettings, setAvatarSettings] = useState({ emoji: '👽', bgColor: null });

  // Load avatar settings - refresh when path changes (returning from edit avatar)
  useEffect(() => {
    setAvatarSettings(getAvatarSettings());
  }, [currentPath]);

  // Update currentPath when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange);
    
    // Store the original pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Override pushState to trigger our handler
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    
    // Override replaceState to trigger our handler
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const storedUser = getCurrentUser();
        const currentUserId = getCurrentUserId();
        const path = window.location.pathname;
        const match = path.match(/\/user\/([^/]+)/);
        const userFromPath = match ? match[1] : null;
        const query = new URLSearchParams(window.location.search);
        const userFromQuery = query.get('user');

        let userIdToLoad = userFromPath || userFromQuery || currentUserId;
        if (!userIdToLoad) return;

        // If userIdToLoad looks like a username (not a MongoDB ObjectId), find the user by username
        const isMongoId = /^[a-f\d]{24}$/i.test(userIdToLoad);
        let userData = null;
        
        if (!isMongoId && userIdToLoad !== currentUserId) {
          // It's a username - need to find the user first
          const { listUsers } = await import('../api/usersApi');
          try {
            const response = await listUsers({ limit: 500 });
            const users = response.items || [];
            const foundUser = users.find(u => 
              u.username?.toLowerCase() === userIdToLoad.toLowerCase()
            );
            if (foundUser) {
              userData = foundUser;
              userIdToLoad = foundUser._id;
            }
          } catch (err) {
            // Failed to find user by username
          }
        }
        
        // If we didn't find by username search, try direct API call
        if (!userData) {
          userData = await getUser(userIdToLoad);
        }

        // Check if viewing own profile
        const viewingOwnProfile = userIdToLoad === currentUserId || 
          userData?.username?.toLowerCase() === storedUser?.username?.toLowerCase();
        setIsOwnProfile(viewingOwnProfile);
        setViewedUserId(userData?._id || userIdToLoad);

        const createdDate = new Date(userData.createdAt || Date.now());
        const now = new Date();
        const yearsDiff = Math.floor((now - createdDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        setUser({
          username: userData.username || storedUser?.username || 'User',
          displayName: userData.displayName || userData.username || storedUser?.username || 'User',
          fullUsername: `u/${userData.username || storedUser?.username || 'user'}`,
          karma: userData.karma || 1,
          contributions: userData.contributions || 9,
          redditAge: yearsDiff > 0 ? `${yearsDiff} y` : '< 1 y',
          activeIn: userData.activeIn || 0,
          goldEarned: userData.goldEarned || 0,
          followers: userData.followers || 1,
          cakeDay: createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          avatar: userData.image || null,
          about: userData.about || userData.bio || '',
          email: userData.email,
          _id: userData._id || userIdToLoad,
          isNSFW: userData.isNSFW || false,
        });
      } catch (error) {
        const storedUser = getCurrentUser();
        if (storedUser) {
          setUser({
            username: storedUser.username,
            displayName: storedUser.username,
            fullUsername: `u/${storedUser.username}`,
            karma: 1,
            contributions: 0,
            redditAge: '< 1 y',
            activeIn: 0,
            goldEarned: 0,
            followers: 0,
            cakeDay: new Date().toLocaleDateString(),
            avatar: storedUser.image || null,
            bio: '',
            _id: storedUser._id,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [currentPath]);  // Re-run when path changes

  // State for other user's public data
  const [otherUserPosts, setOtherUserPosts] = useState([]);
  const [otherUserComments, setOtherUserComments] = useState([]);
  const [otherUserLoading, setOtherUserLoading] = useState(false);

  // Fetch other user's public data if not viewing own profile
  useEffect(() => {
    if (!isOwnProfile && viewedUserId && user) {
      const fetchOtherUserData = async () => {
        setOtherUserLoading(true);
        try {
          // Try to fetch user-specific posts first
          let userPosts = [];
          try {
            // Fallback: Fetch all posts and filter by user
            const postsResponse = await postsAPI.getAll();
            
            // Handle paginated response - extract items array
            const allPosts = Array.isArray(postsResponse) ? postsResponse : (postsResponse.items || []);
            
            userPosts = allPosts.filter(post => {
              return post.userId === viewedUserId || 
                post.authorId === viewedUserId ||
                String(post.userId) === String(viewedUserId) ||
                String(post.authorId) === String(viewedUserId) ||
                post.author === user.username;
            });
          } catch (err) {
            // Silent fail
          }
          setOtherUserPosts(userPosts);

          // Try to fetch user-specific comments first
          let userComments = [];
          try {
            // Fallback: Fetch all comments and filter by user
            const commentsResponse = await commentsAPI.listAll();
            
            // Handle paginated response - extract items array
            const allComments = Array.isArray(commentsResponse) ? commentsResponse : (commentsResponse.items || []);
            
            userComments = allComments.filter(comment => {
              return comment.userId === viewedUserId ||
                String(comment.userId) === String(viewedUserId) ||
                comment.author === user.username;
            });
          } catch (err) {
            // Silent fail
          }
          setOtherUserComments(userComments);
          
          // Check if current user is following this user
          const { getMyFollowing } = await import('../api/usersApi');
          try {
            const followingData = await getMyFollowing({ limit: 1000 });
            const followingList = followingData.items || [];
            const isCurrentlyFollowing = followingList.some(followedUser => 
              String(followedUser._id) === String(viewedUserId) ||
              String(followedUser.userId) === String(viewedUserId)
            );
            setIsFollowing(isCurrentlyFollowing);
          } catch (err) {
            // Silent fail
          }
        } catch (err) {
          // Silent fail
        } finally {
          setOtherUserLoading(false);
        }
      };
      fetchOtherUserData();
    }
  }, [isOwnProfile, viewedUserId, user]);

  // Profile data hook - only use for own profile

  // Profile data hook - only use for own profile
  const myProfileData = useMyProfileData();
  
  // Use appropriate data source based on whose profile we're viewing
  const {
    posts: userPosts,
    comments: userComments,
    savedPosts,
    hiddenPosts,
    upvotedPosts,
    downvotedPosts,
    loading: profileLoading,
    error: profileError,
    refreshProfileData
  } = isOwnProfile ? myProfileData : {
    posts: otherUserPosts,
    comments: otherUserComments,
    savedPosts: [],
    hiddenPosts: [],
    upvotedPosts: [],
    downvotedPosts: [],
    loading: otherUserLoading,
    error: null,
    refreshProfileData: () => {}
  };

  // Refresh profile data when navigating to profile page (only for own profile)
  useEffect(() => {
    if (!isOwnProfile) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProfileData();
      }
    };

    // Refresh when page becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Refresh when component mounts (user navigates to profile)
    refreshProfileData();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshProfileData, isOwnProfile]);

  // Upvote/Downvote handlers for profile tab posts
  const { upvotePost, downvotePost } = require('../hooks/usePosts');

  // eslint-disable-next-line no-unused-vars
  const handleProfileUpvote = async (postId) => {
    await upvotePost(postId);
    refreshProfileData();
  };

  // eslint-disable-next-line no-unused-vars
  const handleProfileDownvote = async (postId) => {
    await downvotePost(postId);
    refreshProfileData();
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!getCurrentUserId()) {
      navigate('/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowUser(viewedUserId);
        setIsFollowing(false);
        
        // Update follower count
        if (user && typeof user.followers === 'number') {
          setUser({ ...user, followers: Math.max(0, user.followers - 1) });
        }
      } else {
        const result = await followUser(viewedUserId);
        setIsFollowing(true);
        
        // Update follower count
        if (user && typeof user.followers === 'number') {
          setUser({ ...user, followers: user.followers + 1 });
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Provide more specific error messages
      if (errorMessage.includes('not allowed') || errorMessage.includes('allowFollowing')) {
        alert('This user has disabled followers. You cannot follow them.');
      } else if (errorMessage.includes('404')) {
        alert('User not found.');
      } else if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        alert('Please log in to follow users.');
        navigate('/login');
      } else {
        alert('Failed to update follow status: ' + errorMessage);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle start chat
  const handleStartChat = async () => {
    if (!getCurrentUserId()) {
      navigate('/login');
      return;
    }
    
    try {
      const currentUser = getCurrentUser();
      const targetUserId = user._id || viewedUserId;
      
      // Check if a chat already exists with this user
      const existingChats = await fetchChats();
      const existingChat = existingChats.find(chat => {
        // Check if target user is in this chat (could be user1 or user2)
        const user1Id = chat.user1?.id || chat.user1?._id;
        const user2Id = chat.user2?.id || chat.user2?._id;
        return user1Id === targetUserId || user2Id === targetUserId;
      });
      
      if (existingChat) {
        // Chat already exists, navigate to it
        navigate(`/chat/${existingChat._id}`);
        return;
      }
      
      // No existing chat, create a new one
      const chatData = {
        user1: {
          id: currentUser._id,
          name: currentUser.username || currentUser.displayName || 'User',
          image: currentUser.image ? { link: currentUser.image } : {},
        },
        user2: {
          id: targetUserId,
          name: user.username || user.displayName || 'User',
          image: user.avatar ? { link: user.avatar } : {},
        },
        lastMessage: '',
        updatedAt: new Date(),
      };
      const chat = await createChat(chatData);
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('blocked')) {
        alert('Cannot start a chat. You or the other user may have blocked each other.');
      } else {
        alert('Failed to start chat: ' + errorMessage);
      }
    }
  };


  if (loading || profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-page">
        <div className="profile-error">{profileError}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">Please log in to view your profile</div>
      </div>
    );
  }

  // Define tabs - filter private tabs if viewing another user's profile
  const allTabs = [
    { id: 'overview', label: 'Overview', public: true },
    { id: 'posts', label: 'Posts', public: true },
    { id: 'comments', label: 'Comments', public: true },
    { id: 'saved', label: 'Saved', public: false },
    { id: 'history', label: 'History', public: false },
    { id: 'hidden', label: 'Hidden', public: false },
    { id: 'upvoted', label: 'Upvoted', public: false },
    { id: 'downvoted', label: 'Downvoted', public: false },
  ];
  
  const tabs = isOwnProfile ? allTabs : allTabs.filter(tab => tab.public);

  const renderEmptyState = (type) => {
    // Different messages for own profile vs viewing another user
    const getTitle = () => {
      if (isOwnProfile) {
        switch (type) {
          case 'posts': return "You don't have any posts yet";
          case 'comments': return "You don't have any comments yet";
          case 'saved': return "You haven't saved anything yet";
          case 'history': return "No browsing history";
          case 'hidden': return "No hidden posts";
          case 'upvoted': return "You haven't upvoted anything yet";
          case 'downvoted': return "You haven't downvoted anything yet";
          case 'overview': return "You don't have any posts yet";
          default: return "Nothing here yet";
        }
      } else {
        const username = user?.username || 'This user';
        switch (type) {
          case 'posts': return `${username} hasn't posted anything yet`;
          case 'comments': return `${username} hasn't commented yet`;
          case 'overview': return `${username} hasn't posted anything yet`;
          default: return "Nothing here yet";
        }
      }
    };

    return (
      <div className="profile-empty-state">
        <div className="empty-state-icon">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <ellipse cx="40" cy="60" rx="20" ry="6" fill="#EDEFF1"/>
            <path d="M30 35 Q30 25 40 25 Q50 25 50 35 L50 50 Q50 55 45 55 L35 55 Q30 55 30 50 Z" fill="#EDEFF1"/>
            <circle cx="35" cy="42" r="4" fill="#FF4500"/>
            <circle cx="45" cy="42" r="4" fill="#FF4500"/>
          </svg>
        </div>
        <h3 className="empty-state-title">{getTitle()}</h3>
        {isOwnProfile && (
          <>
            <p className="empty-state-text">
              Any posts you make to communities will be hidden from your profile. To show them, update your settings.
            </p>
            <button className="empty-state-btn" onClick={() => onNavigate('settings', '/settings')}>
              Update Settings
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="profile-page">
      {/* Left Sidebar */}
      <aside className="profile-left-sidebar">
        <CommunityList />
      </aside>

      <div className="profile-layout">
        {/* Main Content */}
        <main className="profile-main">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-header-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="header-avatar-img" />
              ) : isOwnProfile ? (
                <div 
                  className="header-avatar-emoji"
                  style={{ backgroundColor: avatarSettings.bgColor || '#ff4500' }}
                >
                  {avatarSettings.emoji || '👽'}
                </div>
              ) : (
                <div className="header-avatar-default">
                  <svg viewBox="0 0 20 20" width="60" height="60">
                    <path fill="#D7DADC" d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18.75A8.75 8.75 0 0 1 1.25 10 8.68 8.68 0 0 1 3.07 4.63l.06-.05A8.74 8.74 0 0 1 10 1.25a8.63 8.63 0 0 1 5.11 1.67 8.75 8.75 0 0 1-5.11 15.83zm4.04-11.19a1.55 1.55 0 1 1-1.55-1.55 1.55 1.55 0 0 1 1.55 1.55zm-6.53 0a1.55 1.55 0 1 1-1.55-1.55 1.55 1.55 0 0 1 1.55 1.55zm6.24 4.32a.62.62 0 0 1 0 .88 5.51 5.51 0 0 1-7.5 0 .62.62 0 1 1 .88-.88 4.26 4.26 0 0 0 5.74 0 .62.62 0 0 1 .88 0z"/>
                  </svg>
                </div>
              )}
              {isOwnProfile && (
                <button className="avatar-edit-btn" title="Edit avatar" onClick={() => onNavigate('edit-avatar', '/edit-avatar')}>
                  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="profile-header-info">
              <div className="profile-name-row">
                <h1 className="profile-display-name">{user.displayName}</h1>
                {user.isNSFW && <span className="nsfw-badge">18+</span>}
              </div>
              <p className="profile-username">{user.fullUsername}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Visibility Banner */}
          <div className="content-visibility-banner">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>Hiding all content</span>
            <svg className="chevron-right" viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Create Post Bar */}
          <div className="profile-create-bar">
            <button className="create-post-btn" onClick={() => onNavigate('create-post', '/submit')}>
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Create Post
            </button>
            <button className="filter-btn">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
              </svg>
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'overview' && (
              userPosts.length === 0 && userComments.length === 0
                ? renderEmptyState('overview')
                : <>
                    {userPosts.map((post) => (
                      <Post
                        key={post._id}
                        postId={post._id}
                        title={post.title}
                        author={post.author || post.userId}
                        subreddit={post.subreddit}
                        timestamp={post.createdAt}
                        score={post.score || 0}
                        commentCount={post.commentCount || 0}
                        textBody={post.textBody}
                        onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                        onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                        onRefresh={refreshProfileData}
                      />
                    ))}
                    <div className="comments-list">
                      {userComments.map((comment) => (
                        <ProfileCommentCard 
                          key={comment._id} 
                          comment={comment}
                          username={user?.username}
                        />
                      ))}
                    </div>
                  </>
            )}
            {activeTab === 'posts' && (
              userPosts.length === 0 ? renderEmptyState('posts') : (
                <div className="posts-list">
                  {userPosts.map((post) => (
                    <Post
                      key={post._id}
                      postId={post._id}
                      title={post.title}
                      author={post.author || post.userId}
                      subreddit={post.subreddit}
                      timestamp={post.createdAt}
                      score={post.score || 0}
                      commentCount={post.commentCount || 0}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                      onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                      onRefresh={refreshProfileData}
                    />
                  ))}
                </div>
              )
            )}
            {activeTab === 'comments' && (
              userComments.length === 0 ? renderEmptyState('comments') : (
                <div className="comments-list">
                  {userComments.map((comment) => (
                    <ProfileCommentCard 
                      key={comment._id} 
                      comment={comment}
                      username={user?.username}
                    />
                  ))}
                </div>
              )
            )}
            {activeTab === 'saved' && (
              savedPosts.length === 0 ? renderEmptyState('saved') : (
                <div className="posts-list">
                  {savedPosts.map((post) => (
                    <Post
                      key={post._id}
                      postId={post._id}
                      title={post.title}
                      author={post.author || post.userId}
                      subreddit={post.subreddit}
                      timestamp={post.createdAt}
                      score={post.score || 0}
                      commentCount={post.commentCount || 0}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                      onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                      onRefresh={refreshProfileData}
                    />
                  ))}
                </div>
              )
            )}
            {activeTab === 'history' && renderEmptyState('history')}
            {activeTab === 'hidden' && (
              hiddenPosts.length === 0 ? renderEmptyState('hidden') : (
                <div className="posts-list">
                  {hiddenPosts.map((post) => (
                    <Post
                      key={post._id}
                      postId={post._id}
                      title={post.title}
                      author={post.author || post.userId}
                      subreddit={post.subreddit}
                      timestamp={post.createdAt}
                      score={post.score || 0}
                      commentCount={post.commentCount || 0}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                      onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                      onRefresh={refreshProfileData}
                    />
                  ))}
                </div>
              )
            )}
            {activeTab === 'upvoted' && (
              upvotedPosts.length === 0 ? renderEmptyState('upvoted') : (
                <div className="posts-list">
                  {upvotedPosts.map((post) => (
                    <Post
                      key={post._id}
                      postId={post._id}
                      title={post.title}
                      author={post.author || post.userId}
                      subreddit={post.subreddit}
                      timestamp={post.createdAt}
                      score={post.score || 0}
                      commentCount={post.commentCount || 0}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                      onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                      onRefresh={refreshProfileData}
                    />
                  ))}
                </div>
              )
            )}
            {activeTab === 'downvoted' && (
              downvotedPosts.length === 0 ? renderEmptyState('downvoted') : (
                <div className="posts-list">
                  {downvotedPosts.map((post) => (
                    <Post
                      key={post._id}
                      postId={post._id}
                      title={post.title}
                      author={post.author || post.userId}
                      subreddit={post.subreddit}
                      timestamp={post.createdAt}
                      score={post.score || 0}
                      commentCount={post.commentCount || 0}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${post.subreddit}/comments/${post._id}`)}
                      onSubredditClick={() => navigate(`/r/${post.subreddit}`)}
                      onRefresh={refreshProfileData}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </main>

        {/* Right Sidebar - Profile Card */}
        <aside className="profile-right-sidebar">
          <div className="profile-card">
            {/* Username and Menu Row */}
            <div className="profile-card-header">
              <span className="profile-card-username">{user.displayName || user.username}</span>
              <button className="profile-card-menu-btn" title="More options">
                <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="profile-card-content">
              {/* Follow and Chat buttons - only show when viewing another user's profile */}
              {!isOwnProfile && (
                <div className="profile-card-actions">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {!isFollowing && (
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                      </svg>
                    )}
                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="start-chat-btn" onClick={handleStartChat}>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                    </svg>
                    Start Chat
                  </button>
                </div>
              )}

              {/* About/Description */}
              {user.about && (
                <p className="profile-card-about">{user.about}</p>
              )}
              
              {/* Stats */}
              <div className="profile-card-stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{user.karma}</span>
                  <span className="stat-name">Karma</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.contributions}</span>
                  <span className="stat-name">Contributions</span>
                </div>
              </div>

              <div className="profile-card-stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{user.redditAge}</span>
                  <span className="stat-name">Reddit Age</span>
                </div>
                <div className="stat-item clickable">
                  <span className="stat-number">
                    <span className="active-communities-icons">🏠</span>
                    {user.activeIn}
                  </span>
                  <span className="stat-name">Active in &gt;</span>
                </div>
              </div>

              {/* Achievements */}
              <div className="profile-card-section">
                <h4 className="section-title">ACHIEVEMENTS</h4>
                <div className="achievements-row">
                  <div className="achievement-badges">
                    <span className="achievement-badge">🔥</span>
                    <span className="achievement-badge">🎯</span>
                    <span className="achievement-badge">💬</span>
                  </div>
                  <div className="achievement-info">
                    <span className="achievement-names">Popular Post, 365-Day Streak, Sharing Advocate, +41 more</span>
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="achievements-footer">
                    <button className="view-achievements-link" onClick={() => onNavigate('achievements', '/achievements')}>
                      View your achievements
                    </button>
                  </div>
                )}
              </div>

              {/* Trophy Case */}
              <div className="profile-card-section">
                <h4 className="section-title">TROPHY CASE</h4>
                <div className="trophy-item">
                  <div className="trophy-icon">🏆</div>
                  <span className="trophy-name">Three-Year Club</span>
                </div>
              </div>

              {/* Settings - Only show for own profile */}
              {isOwnProfile && (
                <div className="profile-card-section">
                  <h4 className="section-title">SETTINGS</h4>
                  
                  <div className="settings-item">
                    <div className="settings-item-icon">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="settings-avatar" />
                      ) : (
                        <div 
                          className="settings-avatar-emoji"
                          style={{ backgroundColor: avatarSettings.bgColor || '#ff4500' }}
                        >
                          {avatarSettings.emoji || '👽'}
                        </div>
                      )}
                    </div>
                    <div className="settings-item-content">
                      <span className="settings-item-title">Profile</span>
                      <span className="settings-item-desc">Customize your profile</span>
                    </div>
                    <button className="settings-update-btn" onClick={() => onNavigate('settings', '/settings')}>
                      Update
                    </button>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-icon">
                      <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="settings-item-content">
                      <span className="settings-item-title">Curate your profile</span>
                      <span className="settings-item-desc">Manage what people see when they visit your profile</span>
                    </div>
                    <button className="settings-update-btn" onClick={() => onNavigate('settings', '/settings')}>
                      Update
                    </button>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-icon">
                      <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="settings-item-content">
                      <span className="settings-item-title">Avatar</span>
                      <span className="settings-item-desc">Customize your avatar</span>
                    </div>
                    <button className="settings-update-btn" onClick={() => onNavigate('edit-avatar', '/edit-avatar')}>
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;
