import React, { useEffect, useMemo, useState } from 'react';
import './PostPage.css';
import CommentList from '../features/comments/CommentList';
import CommunityList from '../features/communities/CommunityList';
import { navigate } from '../utils/helpers';
import { usePost } from '../hooks/usePosts';
import { useComments, useCreateComment } from '../hooks/useComments';
import { getCurrentUserId, isLoggedIn, getUserToken } from '../utils/auth';
import { summarizePost, isGeminiAvailable } from '../utils/gemini';
import { DEFAULT_COMMUNITY_ICON, DEFAULT_USER_ICON } from '../utils/placeholders';
import postsAPI from '../api/postsAPI';

// Helper functions for vote persistence
const getVoteKey = (userId, postIdVal) => `vote_${userId}_${postIdVal}`;

const getUserVote = (postIdVal) => {
  const userId = getCurrentUserId();
  if (!userId || !postIdVal) return null;
  const vote = localStorage.getItem(getVoteKey(userId, postIdVal));
  return vote === 'up' || vote === 'down' ? vote : null;
};

const setUserVote = (postIdVal, vote) => {
  const userId = getCurrentUserId();
  if (!userId || !postIdVal) return;
  const key = getVoteKey(userId, postIdVal);
  if (vote === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, vote);
  }
};

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function formatScore(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return String(num);
}

function PostPage() {
  const [communityName, setCommunityName] = useState('');
  const [postId, setPostId] = useState('');
  const [focusComment, setFocusComment] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [sortBy, setSortBy] = useState('Best'); // eslint-disable-line no-unused-vars
  const [newCommentText, setNewCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localVote, setLocalVote] = useState(null);
  const [localScore, setLocalScore] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  
  const { post, loading, error, refetch } = usePost(postId);
  const { comments, loading: commentsLoading, error: commentsError, refetch: refetchComments } = useComments(post?._id || post?.postId);
  const { createComment } = useCreateComment();

  useEffect(() => {
    const path = window.location.pathname; // /r/:name/comments/:postId
    const match = path.match(/\/r\/(.+?)\/comments\/(.+)/);
    if (match) {
      setCommunityName(match[1]);
      setPostId(match[2]);
    }
    const search = window.location.search;
    if (search && /comment=1/.test(search)) {
      setFocusComment(true);
    }

  }, []);

  // Load user's previous vote and score
  useEffect(() => {
    if (postId) {
      const previousVote = getUserVote(postId);
      setLocalVote(previousVote);
    }
  }, [postId]);

  useEffect(() => {
    if (post) {
      setLocalScore(Number(post.score) || 0);
    }
  }, [post]);

  // Check if user is joined (simplified - check localStorage)
  useEffect(() => {
    if (communityName) {
      const joined = localStorage.getItem(`joined_${communityName}`) === 'true';
      setIsJoined(joined);
    }
  }, [communityName]);

  const handleUpvote = async () => {
    if (!isLoggedIn() || !getUserToken()) {
      navigate('/login');
      return;
    }
    
    const prevVote = localVote;
    const prevScore = localScore;
    const nextVote = prevVote === 'up' ? null : 'up';
    
    let delta = 0;
    if (prevVote === 'up') {
      delta = -1;
    } else if (prevVote === 'down') {
      delta = 2;
    } else {
      delta = 1;
    }
    
    const optimisticScore = prevScore + delta;
    setLocalVote(nextVote);
    setLocalScore(optimisticScore);
    setUserVote(postId, nextVote);

    try {
      await postsAPI.update(postId, { score: optimisticScore });
    } catch (err) {
      console.warn('Failed to sync vote to backend:', err);
    }
  };

  const handleDownvote = async () => {
    if (!isLoggedIn() || !getUserToken()) {
      navigate('/login');
      return;
    }
    
    const prevVote = localVote;
    const prevScore = localScore;
    const nextVote = prevVote === 'down' ? null : 'down';
    
    let delta = 0;
    if (prevVote === 'down') {
      delta = 1;
    } else if (prevVote === 'up') {
      delta = -2;
    } else {
      delta = -1;
    }
    
    const optimisticScore = prevScore + delta;
    setLocalVote(nextVote);
    setLocalScore(optimisticScore);
    setUserVote(postId, nextVote);

    try {
      await postsAPI.update(postId, { score: optimisticScore });
    } catch (err) {
      console.warn('Failed to sync vote to backend:', err);
    }
  };

  const handleJoinToggle = () => {
    const newJoined = !isJoined;
    setIsJoined(newJoined);
    localStorage.setItem(`joined_${communityName}`, String(newJoined));
  };

  const handleSubmitNewComment = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;

    const userId = getCurrentUserId();
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      await createComment(post?._id || post?.postId || postId, {
        userId,
        text: trimmed,
        parentCommentId: null,
      });
      setNewCommentText('');
      refetchComments();
    } catch (err) {
      console.error('Create comment error:', err);
      alert('Failed to create comment: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleQuickComment = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitNewComment(newCommentText);
    }
  };

  const handleSubmitReply = async (parentCommentId, text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;

    const userId = getCurrentUserId();
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      await createComment(post?._id || post?.postId || postId, {
        userId,
        text: trimmed,
        parentCommentId: parentCommentId || null,
      });
      refetchComments();
    } catch (err) {
      console.error('Reply error:', err);
      alert('Failed to create reply: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleVote = () => {
    alert('Poll voting is not yet connected to the API.');
  };

  const totalPollVotes = useMemo(() => {
    const opts = Array.isArray(post?.pollOptions) ? post.pollOptions : [];
    return opts.reduce((sum, opt) => sum + (Number(opt?.votes) || 0), 0);
  }, [post]);

  // Handle image carousel for posts with multiple images
  const images = useMemo(() => {
    if (!post) return [];
    if (Array.isArray(post.images) && post.images.length > 0) return post.images;
    if (post.imageUrl) return [post.imageUrl];
    return [];
  }, [post]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleSummarize = async () => {
    if (!post) return;
    setAiSummaryLoading(true);
    try {
      const content =
        post.textBody ||
        post.content ||
        (post.type === 'link' ? post.linkUrl : '') ||
        '';
      const summary = await summarizePost(post.title || 'Post', content);
      setAiSummary(summary);
    } catch (err) {
      setAiSummary(err?.message || 'Failed to generate summary.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="post-page">
        <div className="post-left-sidebar">
          <CommunityList />
        </div>
        <div className="post-main-container">
          <div className="loading">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-page">
        <div className="post-left-sidebar">
          <CommunityList />
        </div>
        <div className="post-main-container">
          <p className="error">Failed to load post: {error}</p>
          <button onClick={refetch} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-page">
        <div className="post-left-sidebar">
          <CommunityList />
        </div>
        <div className="post-main-container">
          <p className="error">Post not found.</p>
        </div>
      </div>
    );
  }

  const authorName = post.author || post.username || 'unknown';
  const subredditName = communityName || post.subredditKey || post.subreddit || 'community';
  const timeAgo = formatRelativeTime(post.createdAt || post.timestamp);
  const commentCount = Number.isFinite(Number(post.commentCount)) ? Number(post.commentCount) : (Array.isArray(comments) ? comments.length : 0);

  return (
    <div className="post-page">
      {/* Left Sidebar */}
      <div className="post-left-sidebar">
        <CommunityList />
      </div>

      {/* Main Content */}
      <div className="post-main-container">
        {/* Back Button */}
        <button className="post-back-btn" onClick={() => window.history.back()}>
          ←
        </button>

        {/* Post Header */}
        <div className="post-page-header">
          <img 
            src={post.subredditIcon || DEFAULT_COMMUNITY_ICON} 
            alt="" 
            className="community-icon"
            onError={(e) => { e.target.src = DEFAULT_COMMUNITY_ICON; }}
          />
          <div className="header-info">
            <a href={`/r/${subredditName}`} className="community-link">r/{subredditName}</a>
            <span className="separator">•</span>
            <span className="post-meta">{timeAgo}</span>
            <span className="separator">•</span>
            <a href={`/user/${post.authorId || post.userId || ''}`} className="author-link">{authorName}</a>
          </div>
          <button className="more-btn">⋯</button>
        </div>

        {/* Post Title */}
        <h1 className="post-page-title">{post.title}</h1>

        {/* Post Content */}
        <div className="post-page-content">
          {/* Image Carousel */}
          {post.type === 'image' && images.length > 0 && (
            <div className="post-carousel">
              <div className="post-page-image-container">
                <img 
                  src={images[currentImageIndex]} 
                  alt={post.title} 
                  className="post-page-image"
                />
                {images.length > 1 && (
                  <>
                    <button className="post-carousel-nav prev" onClick={handlePrevImage}>‹</button>
                    <button className="post-carousel-nav next" onClick={handleNextImage}>›</button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="post-carousel-dots">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Body */}
          {post.textBody && (
            <div className="post-body">
              <p>{post.textBody}</p>
            </div>
          )}

          {/* Link Type */}
          {post.type === 'link' && (
            <div className="post-link-card">
              <a href={post.linkUrl} target="_blank" rel="noreferrer" className="link-url">{post.linkUrl}</a>
              {post.textBody && <p className="link-description">{post.textBody}</p>}
            </div>
          )}

          {/* Poll Type */}
          {post.type === 'poll' && post.pollOptions && (
            <div className="post-poll">
              {post.pollOptions.map((opt) => {
                const total = totalPollVotes || 1;
                const pct = Math.round(((opt.votes || 0) / total) * 100);
                return (
                  <button
                    key={opt.id}
                    className="poll-option"
                    onClick={() => handleVote(opt.id)}
                  >
                    <div className="poll-label-row">
                      <span>{opt.label}</span>
                      <span className="poll-pct">{pct}%</span>
                    </div>
                    <div className="poll-bar">
                      <div className="poll-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="poll-votes">{opt.votes || 0} votes</div>
                  </button>
                );
              })}
              <div className="poll-total">Total votes: {totalPollVotes}</div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="post-page-actions">
          <div className="post-action-btn vote-group">
            <button 
              className={`vote-btn upvote ${localVote === 'up' ? 'upvoted' : ''}`}
              onClick={handleUpvote}
            >
              ▲
            </button>
            <span className="vote-count">{formatScore(localScore)}</span>
            <button 
              className={`vote-btn downvote ${localVote === 'down' ? 'downvoted' : ''}`}
              onClick={handleDownvote}
            >
              ▼
            </button>
          </div>
          <button className="post-action-btn">
            💬 {formatScore(commentCount)}
          </button>
          <button className="post-action-btn">
            🏆
          </button>
          <button className="post-action-btn">
            ↗ Share
          </button>
        </div>

        {/* AI Summary */}
        <div className="ai-summary">
          <div className="ai-summary-row">
            <button
              className="ai-summary-btn"
              type="button"
              onClick={handleSummarize}
              disabled={aiSummaryLoading}
            >
              {aiSummaryLoading ? 'Summarizing…' : 'Summarize with AI'}
            </button>
            {!isGeminiAvailable() && (
              <span className="ai-summary-note">Using fallback summary (no API key)</span>
            )}
          </div>

          {aiSummary && (
            <div className="ai-summary-box">
              <div className="ai-summary-title">Summary</div>
              <div className="ai-summary-text">{aiSummary}</div>
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="add-comment-container">
          <div className="add-comment-input-wrapper">
            <input
              type="text"
              className="add-comment-input"
              placeholder="Add your reply"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={handleQuickComment}
            />
            <button className="add-comment-expand-btn">⤢</button>
          </div>
        </div>

        {/* Comment Sort Bar */}
        <div className="comment-sort-bar">
          <span className="sort-label">Sort by:</span>
          <button className="sort-dropdown">
            {sortBy} ▾
          </button>
          <button className="search-comments-btn">
            🔍 Search Comments
          </button>
        </div>

        {/* Comments Section */}
        <section className="comments-section-full">
          {commentsLoading && <div className="loading">Loading comments...</div>}
          {commentsError && (
            <div className="error">
              Failed to load comments: {commentsError}
              <button onClick={refetchComments} className="retry-btn">Retry</button>
            </div>
          )}
          {!commentsLoading && !commentsError && (
            <CommentList 
              postId={post.postId || post._id} 
              comments={comments} 
              onSubmitNewComment={handleSubmitNewComment}
              onSubmitReply={handleSubmitReply}
              autoFocus={focusComment}
              postAuthorId={post.authorId || post.userId}
            />
          )}
        </section>
      </div>

      {/* Right Sidebar */}
      <div className="post-right-sidebar">
        {/* Community Card */}
        <div className="sidebar-community-card">
          <div className="sidebar-community-header">
            <a href={`/r/${subredditName}`} className="sidebar-community-name">r/{subredditName}</a>
            <button 
              className={`sidebar-join-btn ${isJoined ? 'joined' : ''}`}
              onClick={handleJoinToggle}
            >
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
          <div className="sidebar-community-body">
            <h3 className="sidebar-community-title">{subredditName}</h3>
            <p className="sidebar-community-description">
              Welcome to r/{subredditName}! A community for sharing and discussing.
            </p>
            <button className="sidebar-show-more">Show more</button>
            
            <div className="sidebar-community-meta">
              <div className="sidebar-meta-item">
                📅 Created Jan 25, 2008
              </div>
              <div className="sidebar-meta-item">
                🌐 Public
              </div>
            </div>

            <div className="sidebar-community-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">389K</span>
                <span className="sidebar-stat-label">Weekly visitors</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">6.1K</span>
                <span className="sidebar-stat-label">Weekly contributions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Card */}
        <div className="sidebar-rules-card">
          <h3 className="sidebar-rules-title">Community Rules</h3>
          <div className="sidebar-rule-item">
            <span className="sidebar-rule-number">1</span>
            <span className="sidebar-rule-text">Be respectful and civil</span>
            <span className="sidebar-rule-expand">›</span>
          </div>
          <div className="sidebar-rule-item">
            <span className="sidebar-rule-number">2</span>
            <span className="sidebar-rule-text">No spam or self-promotion</span>
            <span className="sidebar-rule-expand">›</span>
          </div>
          <div className="sidebar-rule-item">
            <span className="sidebar-rule-number">3</span>
            <span className="sidebar-rule-text">Stay on topic</span>
            <span className="sidebar-rule-expand">›</span>
          </div>
          <div className="sidebar-rule-item">
            <span className="sidebar-rule-number">4</span>
            <span className="sidebar-rule-text">No personal attacks</span>
            <span className="sidebar-rule-expand">›</span>
          </div>
          <div className="sidebar-rule-item">
            <span className="sidebar-rule-number">5</span>
            <span className="sidebar-rule-text">Follow Reddit's Content Policy</span>
            <span className="sidebar-rule-expand">›</span>
          </div>
        </div>

        {/* Moderators Card */}
        <div className="sidebar-mods-card">
          <h3 className="sidebar-mods-title">Moderators</h3>
          <button className="sidebar-message-mods-btn">
            ✉️ Message Mods
          </button>
          <div className="sidebar-mod-item">
            <img 
              src={DEFAULT_USER_ICON} 
              alt="" 
              className="sidebar-mod-avatar"
            />
            <div className="sidebar-mod-info">
              <button className="sidebar-mod-username">u/ModeratorUser</button>
            </div>
          </div>
          <button className="sidebar-view-all-mods">View all moderators</button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <a href="/about">About</a>
          <a href="/careers">Careers</a>
          <a href="/press">Press</a>
          <a href="/help">Help</a>
          <a href="/blog">Blog</a>
          <span className="sidebar-footer-copyright">Reddit, Inc. © 2025. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
