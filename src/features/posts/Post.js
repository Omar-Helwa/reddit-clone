import React, { useEffect, useMemo, useState } from 'react';
import './Post.css';
import postsAPI from '../../api/postsAPI';
import { getJoinedCommunities, navigate, joinCommunity, leaveCommunity } from '../../utils/helpers';
import { getCurrentUser, getCurrentUserId, getUserToken, isLoggedIn } from '../../utils/auth';
import { AWARD_CATALOG, addPostAward, getPostAwards } from '../../utils/awards';
import { DEFAULT_COMMUNITY_ICON, DEFAULT_USER_ICON } from '../../utils/placeholders';
import { getUser } from '../../api/usersApi';

let voteEndpointsSupported = null; // null | true | false
let scoreUpdateSupported = null; // null | true | false

const CROSSPOSTED_ORIGINS_KEY = 'crosspostedOriginPostIds';

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getCrosspostedOriginIds() {
  const raw = localStorage.getItem(CROSSPOSTED_ORIGINS_KEY);
  const parsed = safeParseJson(raw, []);
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

function markOriginCrossposted(originPostId) {
  if (!originPostId) return;
  const existing = new Set(getCrosspostedOriginIds());
  existing.add(String(originPostId));
  localStorage.setItem(CROSSPOSTED_ORIGINS_KEY, JSON.stringify(Array.from(existing)));
}

function parseCrosspostOriginFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed.toLowerCase().startsWith('crosspost of:')) return null;
  // Expected prefix: "Crosspost of: /r/<community>/comments/<postId>"
  const match = trimmed.match(/Crosspost of:\s*\/r\/([^\s/]+)\/comments\/([a-f\d]{24})/i);
  if (!match) return null;
  return { community: match[1], postId: match[2] };
}

const Post = ({ 
  postId, 
  communityKey,
  title, 
  author,
  authorId,
  subreddit, 
  timestamp, 
  score, 
  commentCount, 
  textBody, 
  authorIcon,
  subredditIcon,
  onCommentClick,
  onSubredditClick,
  onUpvote,
  onDownvote,
  onSave,
  onHide,
  onRefresh
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [crosspostTarget, setCrosspostTarget] = useState('');
  const [crosspostError, setCrosspostError] = useState('');
  const [crossposting, setCrossposting] = useState(false);
  const [awards, setAwards] = useState({});
  const [localVote, setLocalVote] = useState(null); // 'up' | 'down' | null
  const [localScore, setLocalScore] = useState(Number(score) || 0);
  const [resolvedAuthorName, setResolvedAuthorName] = useState(null);

  // Helper functions to get/set user votes from localStorage
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

  // Load user's previous vote on mount
  useEffect(() => {
    if (postId) {
      const previousVote = getUserVote(postId);
      setLocalVote(previousVote);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const crosspostOriginInfo = useMemo(() => parseCrosspostOriginFromText(textBody), [textBody]);
  const originPostId = crosspostOriginInfo?.postId || postId;
  const isCrosspost = Boolean(crosspostOriginInfo);
  const alreadyCrossposted = useMemo(() => {
    const ids = getCrosspostedOriginIds();
    return ids.includes(String(originPostId));
  }, [originPostId]);

  const derivedAuthorId = authorId || (typeof author === 'string' && /^[a-f\d]{24}$/i.test(author) ? author : null);
  const normalizedAuthor = (resolvedAuthorName || author || '').replace(/^u\//, '') || 'unknown';
  const derivedCommunityKey = (communityKey || (typeof subreddit === 'string' ? subreddit : '') || 'unknown').replace(/^r\//, '') || 'unknown';
  const timestampLabel = useMemo(() => formatRelativeTime(timestamp), [timestamp]);

  useEffect(() => {
    setLocalScore(Number(score) || 0);
  }, [score]);

  useEffect(() => {
    let cancelled = false;
    if (!derivedAuthorId) {
      setResolvedAuthorName(null);
      return undefined;
    }
    if (!/^[a-f\d]{24}$/i.test(String(derivedAuthorId))) return undefined;

    (async () => {
      try {
        const u = await getUser(String(derivedAuthorId));
        const name = u?.username;
        if (!cancelled) setResolvedAuthorName(name || null);
      } catch (e) {
        if (!cancelled) setResolvedAuthorName(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [derivedAuthorId]);

  const authorHref = derivedAuthorId ? `/user/${encodeURIComponent(String(derivedAuthorId))}` : null;

  const joinedTargets = useMemo(() => {
    const list = getJoinedCommunities();
    return list.filter((name) => name && name !== derivedCommunityKey);
  }, [derivedCommunityKey]);

  useEffect(() => {
    setAwards(getPostAwards(postId));
  }, [postId]);

  useEffect(() => {
    if (!shareOpen) {
      setCrossposting(false);
      setCrosspostError('');
      setCrosspostTarget('');
      return;
    }
    if (isCrosspost) {
      setCrosspostError('This post is already a crosspost and cannot be crossposted again.');
    } else if (alreadyCrossposted) {
      setCrosspostError('This post has already been crossposted.');
    }
    if (!crosspostTarget && joinedTargets.length > 0) {
      setCrosspostTarget(joinedTargets[0]);
    }
  }, [shareOpen, joinedTargets, crosspostTarget, isCrosspost, alreadyCrossposted]);

  const handleOpenShare = () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    setShareOpen(true);
  };

  const handleOpenAward = () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    setAwardOpen(true);
  };

  const handleUpvote = async () => {
    if (onUpvote) return onUpvote();

    if (!isLoggedIn() || !getUserToken()) {
      navigate('/login');
      return;
    }
    
    const prevVote = localVote;
    const prevScore = localScore;
    
    // If already upvoted, clicking again removes the vote (toggle off)
    // If downvoted or no vote, clicking upvote sets it to up
    const nextVote = prevVote === 'up' ? null : 'up';
    
    // Calculate score delta based on previous vote state
    let delta = 0;
    if (prevVote === 'up') {
      // Removing upvote: -1
      delta = -1;
    } else if (prevVote === 'down') {
      // Switching from downvote to upvote: +2 (remove -1, add +1)
      delta = 2;
    } else {
      // No previous vote, adding upvote: +1
      delta = 1;
    }
    
    const optimisticScore = prevScore + delta;
    setLocalVote(nextVote);
    setLocalScore(optimisticScore);
    setUserVote(postId, nextVote); // Persist vote to localStorage

    // Call the backend upvote endpoint to track the vote
    try {
      if (nextVote === 'up') {
        await postsAPI.upvote(postId);
        console.log('Upvote saved to backend for post:', postId);
      }
    } catch (err) {
      console.warn('Failed to save upvote to backend:', err);
    }
  };

  const handleDownvote = async () => {
    if (onDownvote) return onDownvote();

    if (!isLoggedIn() || !getUserToken()) {
      navigate('/login');
      return;
    }
    
    const prevVote = localVote;
    const prevScore = localScore;
    
    // If already downvoted, clicking again removes the vote (toggle off)
    // If upvoted or no vote, clicking downvote sets it to down
    const nextVote = prevVote === 'down' ? null : 'down';
    
    // Calculate score delta based on previous vote state
    let delta = 0;
    if (prevVote === 'down') {
      // Removing downvote: +1
      delta = 1;
    } else if (prevVote === 'up') {
      // Switching from upvote to downvote: -2 (remove +1, add -1)
      delta = -2;
    } else {
      // No previous vote, adding downvote: -1
      delta = -1;
    }
    
    const optimisticScore = prevScore + delta;
    setLocalVote(nextVote);
    setLocalScore(optimisticScore);
    setUserVote(postId, nextVote); // Persist vote to localStorage

    // Call the backend downvote endpoint to track the vote
    try {
      if (nextVote === 'down') {
        await postsAPI.downvote(postId);
        console.log('Downvote saved to backend for post:', postId);
      }
    } catch (err) {
      console.warn('Failed to save downvote to backend:', err);
    }
  };

  const handleConfirmCrosspost = async () => {
    if (!crosspostTarget) return;
    setCrossposting(true);
    setCrosspostError('');

    if (isCrosspost) {
      setCrosspostError('This post is already a crosspost and cannot be crossposted again.');
      setCrossposting(false);
      return;
    }

    if (alreadyCrossposted) {
      setCrosspostError('This post has already been crossposted.');
      setCrossposting(false);
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setCrosspostError('You must be logged in to crosspost.');
      setCrossposting(false);
      navigate('/login');
      return;
    }

    const token = getUserToken();
    if (!token) {
      setCrosspostError('You are signed in without a token. Please log in again to crosspost.');
      setCrossposting(false);
      navigate('/login');
      return;
    }

    const originalLink = `/r/${derivedCommunityKey}/comments/${originPostId}`;

    // Backend validates allowed fields; do not send unknown fields like postId/author.
    const payload = {
      title: title?.trim() || 'Crosspost',
      userId,
      subreddit: String(crosspostTarget).replace(/^r\//, ''),
      type: 'text',
      textBody: `Crosspost of: ${originalLink}${textBody ? `\n\n${textBody}` : ''}`,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      commentCount: 0,
    };

    try {
      const created = await postsAPI.create(payload);
      const newId = created?._id || created?.postId;
      markOriginCrossposted(originPostId);
      setShareOpen(false);
      navigate(`/r/${crosspostTarget}/comments/${newId}`);
    } catch (err) {
      setCrosspostError(err?.message || 'Failed to crosspost. Please try again.');
    } finally {
      setCrossposting(false);
    }
  };

  const handleGiveAward = (awardId) => {
    addPostAward(postId, awardId);
    setAwards(getPostAwards(postId));
    setAwardOpen(false);
  };

  const awardEntries = useMemo(() => {
    const entries = Object.entries(awards || {});
    return entries.filter(([, count]) => Number(count) > 0);
  }, [awards]);

  // Check if user has joined this community
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const joined = getJoinedCommunities();
    const communitySlug = derivedCommunityKey;
    setIsJoined(joined.includes(communitySlug));
  }, [derivedCommunityKey]);

  // Join/Leave community handler
  const handleJoinToggle = () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    const communitySlug = derivedCommunityKey;
    if (isJoined) {
      leaveCommunity(communitySlug);
      setIsJoined(false);
    } else {
      joinCommunity(communitySlug);
      setIsJoined(true);
    }
  };

  // More menu handlers
  const handleFollowPost = () => {
    setIsFollowing(!isFollowing);
    setMoreMenuOpen(false);
  };

  const handleSavePost = async () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    try {
      await postsAPI.save(postId);
      setIsSaved(!isSaved);
      console.log('Post saved to backend:', postId);
      
      // Notify parent component if callback provided
      if (onSave) {
        onSave(postId);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    }
    
    setMoreMenuOpen(false);
  };

  const handleHidePost = async () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    try {
      await postsAPI.hide(postId);
      setIsHidden(true);
      console.log('Post hidden in backend:', postId);
      
      // Notify parent component if callback provided
      if (onHide) {
        onHide(postId);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to hide post:', err);
    }
    
    setMoreMenuOpen(false);
  };

  const handleReport = () => {
    setMoreMenuOpen(false);
    alert('Report submitted. Thank you for helping keep Reddit safe.');
  };

  const handleReadRules = () => {
    setMoreMenuOpen(false);
    navigate('/rules');
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuOpen && !e.target.closest('.post-more-menu-container')) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  // If post is hidden, don't render it
  if (isHidden) {
    return null;
  }

  return (
    <article className="post-card" data-post-id={postId}>
      <div className="post-body">
        {/* Credit Bar */}
        <div className="post-credit-bar">
          <div className="post-subreddit-info">
            {subredditIcon && (
              <img 
                src={subredditIcon} 
                alt={subreddit} 
                className="subreddit-icon"
                onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
              />
            )}
            {onSubredditClick ? (
              <button 
                className="subreddit-name-link" 
                onClick={onSubredditClick}
              >
                {subreddit}
              </button>
            ) : (
              <span className="subreddit-name">{subreddit}</span>
            )}
            {/* Only show publisher row if author is not unknown and not empty */}
            {(normalizedAuthor && normalizedAuthor !== 'unknown') && (
              <div className="post-publisher-row">
                {authorHref ? (
                  <span className="post-meta">
                    Posted by{' '}
                    <button
                      type="button"
                      className="post-author-link"
                      onClick={() => navigate(authorHref)}
                    >
                      u/{normalizedAuthor}
                    </button>
                  </span>
                ) : (
                  <span className="post-meta">Posted by u/{normalizedAuthor}</span>
                )}
                <span className="separator">•</span>
                <span className="post-timestamp">{timestampLabel}</span>
              </div>
            )}
            {/* If author is unknown or empty, do not render anything for publisher */}
          </div>
          <div className="post-menu">
            {!isJoined && (
              <button 
                className="join-button"
                onClick={handleJoinToggle}
              >
                Join
              </button>
            )}
            <div className="post-more-menu-container">
              <button 
                aria-label="More options" 
                className="menu-button more-button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </button>
              {moreMenuOpen && (
                <div className="post-more-menu">
                  <button className="post-more-menu-item" onClick={handleFollowPost}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 8.5C15 12.09 10 16 10 16C10 16 5 12.09 5 8.5C5 5.46 7.46 3 10 3C12.54 3 15 5.46 15 8.5Z"/>
                      <circle cx="10" cy="8.5" r="2"/>
                    </svg>
                    <span>{isFollowing ? 'Unfollow post' : 'Follow post'}</span>
                  </button>
                  <button className="post-more-menu-item" onClick={handleSavePost}>
                    <svg viewBox="0 0 20 20" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 3h10v14l-5-3-5 3V3z"/>
                    </svg>
                    <span>{isSaved ? 'Unsave' : 'Save'}</span>
                  </button>
                  <button className="post-more-menu-item" onClick={handleHidePost}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                      <circle cx="10" cy="10" r="3"/>
                      <path d="M3 17L17 3"/>
                    </svg>
                    <span>Hide</span>
                  </button>
                  <button className="post-more-menu-item" onClick={handleReport}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 3v14M4 3h10l-2 4 2 4H4"/>
                    </svg>
                    <span>Report</span>
                  </button>
                  <div className="post-more-menu-divider" />
                  <button className="post-more-menu-item" onClick={handleReadRules}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="4" y="2" width="12" height="16" rx="1"/>
                      <path d="M7 6h6M7 10h6M7 14h4"/>
                    </svg>
                    <span>Read the Rules</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Title */}
        <a href={`/r/${derivedCommunityKey}/comments/${postId}`} className="post-title-link">
          <h2 className="post-title">{title}</h2>
        </a>

        {/* Post Text Body */}
        {textBody && (
          <div className="post-text-body">
            <p>{textBody}</p>
          </div>
        )}

        {awardEntries.length > 0 && (
          <div className="post-awards" aria-label="Awards">
            {awardEntries.map(([awardId, count]) => {
              const meta = AWARD_CATALOG.find((a) => a.id === awardId);
              const icon = meta?.icon || '🏆';
              const label = meta?.label || 'Award';
              return (
                <span key={awardId} className="post-award-pill" title={label}>
                  <span className="post-award-icon" aria-hidden="true">{icon}</span>
                  <span className="post-award-count">{count}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Post Action Bar */}
        <div className="post-action-bar">
          <div className="vote-column" aria-label="Post voting">
            <button 
              className={`vote-button upvote-button ${localVote === 'up' ? 'active' : ''}`}
              onClick={handleUpvote}
              aria-label="Upvote"
            >
              ▲
            </button>
            <div className={`vote-score ${localVote === 'up' ? 'upvoted' : localVote === 'down' ? 'downvoted' : ''}`}>{localScore}</div>
            <button 
              className={`vote-button downvote-button ${localVote === 'down' ? 'active' : ''}`}
              onClick={handleDownvote}
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>

          <button 
            className="action-button comment-button"
            onClick={onCommentClick}
            aria-label="Comments"
          >
            <svg className="icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5.5C2 4.11929 3.11929 3 4.5 3H15.5C16.8807 3 18 4.11929 18 5.5V12.5C18 13.8807 16.8807 15 15.5 15H11L7 18V15H4.5C3.11929 15 2 13.8807 2 12.5V5.5Z"/>
            </svg>
            <span className="count">{commentCount}</span>
          </button>
          
          <button 
            className="action-button share-button"
            aria-label="Share"
            onClick={handleOpenShare}
          >
            <svg className="icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12v4a2 2 0 002 2h8a2 2 0 002-2v-4M12 3l-2-2m0 0L8 3m2-2v11"/>
            </svg>
            <span className="count">Share</span>
          </button>
          
          <button 
            className="action-button award-button"
            aria-label="Award"
            onClick={handleOpenAward}
          >
            <span className="icon">🏆</span>
            <span className="count">Award</span>
          </button>
        </div>
      </div>

      {shareOpen && (
        <div className="post-overlay-backdrop" role="dialog" aria-modal="true" onClick={() => setShareOpen(false)}>
          <div className="post-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="post-overlay-header">
              <strong>Crosspost</strong>
              <button className="post-overlay-close" type="button" onClick={() => setShareOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {joinedTargets.length === 0 ? (
              <div className="post-overlay-body">
                <div className="post-overlay-muted">Join a community to crosspost.</div>
                <div className="post-overlay-actions">
                  <button className="post-overlay-btn" type="button" onClick={() => { setShareOpen(false); navigate('/explore'); }}>
                    Explore communities
                  </button>
                </div>
              </div>
            ) : (
              <div className="post-overlay-body">
                <label className="post-overlay-label" htmlFor={`crosspost-${postId}`}>Choose a community</label>
                <select
                  id={`crosspost-${postId}`}
                  className="post-overlay-select"
                  value={crosspostTarget}
                  onChange={(e) => setCrosspostTarget(e.target.value)}
                  disabled={crossposting || isCrosspost || alreadyCrossposted}
                >
                  {joinedTargets.map((name) => (
                    <option key={name} value={name}>r/{name}</option>
                  ))}
                </select>

                {crosspostError && <div className="post-overlay-error">{crosspostError}</div>}

                <div className="post-overlay-actions">
                  <button className="post-overlay-btn secondary" type="button" onClick={() => setShareOpen(false)} disabled={crossposting}>
                    Cancel
                  </button>
                  <button className="post-overlay-btn" type="button" onClick={handleConfirmCrosspost} disabled={crossposting || isCrosspost || alreadyCrossposted}>
                    {crossposting ? 'Crossposting…' : 'Crosspost'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {awardOpen && (
        <div className="post-overlay-backdrop" role="dialog" aria-modal="true" onClick={() => setAwardOpen(false)}>
          <div className="post-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="post-overlay-header">
              <strong>Give an award</strong>
              <button className="post-overlay-close" type="button" onClick={() => setAwardOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="post-overlay-body">
              <div className="post-award-grid">
                {AWARD_CATALOG.map((award) => (
                  <button
                    key={award.id}
                    type="button"
                    className="post-award-choice"
                    onClick={() => handleGiveAward(award.id)}
                  >
                    <span className="post-award-choice-icon" aria-hidden="true">{award.icon}</span>
                    <span className="post-award-choice-label">{award.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

function formatRelativeTime(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/\bago\b/i.test(trimmed) || trimmed.toLowerCase() === 'just now') return trimmed;
  }

  let timestampMs = null;

  if (typeof value === 'number') {
    timestampMs = value < 1e12 ? value * 1000 : value;
  } else if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    if (!Number.isNaN(parsed)) timestampMs = parsed;
  } else if (value instanceof Date) {
    const parsed = value.getTime();
    if (!Number.isNaN(parsed)) timestampMs = parsed;
  }

  if (!timestampMs) return String(value);

  const now = Date.now();
  const diff = Math.max(0, now - timestampMs);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(timestampMs).toLocaleDateString();
}

export default Post;
