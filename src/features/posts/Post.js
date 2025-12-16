import React, { useEffect, useMemo, useState } from 'react';
import './Post.css';
import postsAPI from '../../api/postsAPI';
import { getJoinedCommunities, navigate } from '../../utils/helpers';
import { getCurrentUser, isLoggedIn } from '../../utils/auth';
import { AWARD_CATALOG, addPostAward, getPostAwards } from '../../utils/awards';

const Post = ({ 
  postId, 
  communityKey,
  title, 
  author, 
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
  onDownvote
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const [crosspostTarget, setCrosspostTarget] = useState('');
  const [crosspostError, setCrosspostError] = useState('');
  const [crossposting, setCrossposting] = useState(false);
  const [awards, setAwards] = useState({});

  const normalizedAuthor = (author || '').replace(/^u\//, '') || 'unknown';
  const derivedCommunityKey = (communityKey || (typeof subreddit === 'string' ? subreddit : '') || 'general').replace(/^r\//, '') || 'general';
  const timestampLabel = useMemo(() => formatRelativeTime(timestamp), [timestamp]);

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
    if (!crosspostTarget && joinedTargets.length > 0) {
      setCrosspostTarget(joinedTargets[0]);
    }
  }, [shareOpen, joinedTargets, crosspostTarget]);

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

  const handleConfirmCrosspost = async () => {
    if (!crosspostTarget) return;
    setCrossposting(true);
    setCrosspostError('');

    const user = getCurrentUser();
    const authorName = (user?.username || 'demo_user').replace(/^u\//, '');
    const originalLink = `/r/${derivedCommunityKey}/comments/${postId}`;

    const payload = {
      postId: `${Date.now()}`,
      title: title?.trim() || 'Crosspost',
      author: authorName,
      subreddit: `r/${crosspostTarget}`,
      type: 'text',
      textBody: `Crosspost of: ${originalLink}${textBody ? `\n\n${textBody}` : ''}`,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await postsAPI.create(payload);
      const newId = created?._id || created?.postId || payload.postId;
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

  return (
    <article className="post-card" data-post-id={postId}>
      <div className="vote-column" aria-label="Post voting">
        <button 
          className="vote-button upvote-button" 
          onClick={onUpvote}
          aria-label="Upvote"
        >
          ▲
        </button>
        <div className="vote-score">{score}</div>
        <button 
          className="vote-button downvote-button" 
          onClick={onDownvote}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>

      <div className="post-body">
        {/* Credit Bar */}
        <div className="post-credit-bar">
          <div className="post-subreddit-info">
            {subredditIcon && (
              <img 
                src={subredditIcon} 
                alt={subreddit} 
                className="subreddit-icon"
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
            <span className="separator">•</span>
            <span className="post-meta">Posted by u/{normalizedAuthor}</span>
            <span className="separator">•</span>
            <span className="post-timestamp">{timestampLabel}</span>
          </div>
          <div className="post-menu">
            <button aria-label="Save" className="menu-button">🔖</button>
            <button aria-label="More options" className="menu-button">⋯</button>
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
          <button 
            className="action-button comment-button"
            onClick={onCommentClick}
            aria-label="Comments"
          >
            <span className="icon">💬</span>
            <span className="count">{commentCount} Comments</span>
          </button>
          
          <button 
            className="action-button share-button"
            aria-label="Share"
            onClick={handleOpenShare}
          >
            <span className="icon">↗</span>
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
                  disabled={crossposting}
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
                  <button className="post-overlay-btn" type="button" onClick={handleConfirmCrosspost} disabled={crossposting}>
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
