import React, { useEffect, useState } from 'react';
import './CommentList.css';
import { getUser } from '../../api/usersApi';
import { navigate } from '../../utils/helpers';
import commentsAPI from '../../api/commentsAPI';
import { getCurrentUserId, getUserToken, isLoggedIn } from '../../utils/auth';
import { DEFAULT_USER_ICON } from '../../utils/placeholders';

let commentScoreUpdateSupported = null; // null | true | false

const COMMENT_INDENT_STEP = 28; // px between each nesting rail

const usernameCache = new Map(); // userId -> username

// Helper functions to get/set user votes from localStorage for comments
const getCommentVoteKey = (userId, commentId) => `comment_vote_${userId}_${commentId}`;

const getUserCommentVote = (commentId) => {
  const userId = getCurrentUserId();
  if (!userId || !commentId) return null;
  const vote = localStorage.getItem(getCommentVoteKey(userId, commentId));
  return vote === 'up' || vote === 'down' ? vote : null;
};

const setUserCommentVote = (commentId, vote) => {
  const userId = getCurrentUserId();
  if (!userId || !commentId) return;
  const key = getCommentVoteKey(userId, commentId);
  if (vote === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, vote);
  }
};

// eslint-disable-next-line no-unused-vars
const CommentList = ({ postId, comments = [], onSubmitNewComment, onSubmitReply, autoFocus = false, postAuthorId = null }) => {
  const [expandedComments, setExpandedComments] = useState({});
  const [collapsedComments, setCollapsedComments] = useState({}); // Track collapsed comments
  const [replyDrafts, setReplyDrafts] = useState({});
  const [usernamesById, setUsernamesById] = useState({});
  const [localVotes, setLocalVotes] = useState({}); // commentId -> 'up' | 'down' | null
  const [localScores, setLocalScores] = useState({}); // commentId -> number

  useEffect(() => {
    const ids = new Set();
    const walk = (arr) => {
      (Array.isArray(arr) ? arr : []).forEach((c) => {
        if (c?.userId) ids.add(String(c.userId));
        if (Array.isArray(c?.replies) && c.replies.length) walk(c.replies);
      });
    };
    walk(comments);

    const missing = Array.from(ids).filter((id) => id && !usernameCache.has(id) && !usernamesById[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of missing) {
        try {
          const u = await getUser(id);
          const name = u?.username;
          if (!name) continue;
          usernameCache.set(id, name);
          if (!cancelled) {
            setUsernamesById((prev) => ({ ...prev, [id]: name }));
          }
        } catch (e) {
          // ignore
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [comments, usernamesById]);

  const toggleReply = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSubmitReplyLocal = (commentId) => {
    const text = (replyDrafts[commentId] || '').trim();
    if (!text) return;
    if (typeof onSubmitReply === 'function') {
      onSubmitReply(commentId, text);
    } else {
      console.log('Submit reply:', { postId, parentCommentId: commentId, text });
    }
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [commentId]: false }));
  };

  const formatRelativeTime = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (/\bago\b/i.test(trimmed) || trimmed.toLowerCase() === 'just now') return trimmed;
    }

    const ts = new Date(value).getTime();
    if (Number.isNaN(ts)) return String(value);
    const now = Date.now();
    const diff = Math.max(0, now - ts);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return new Date(ts).toLocaleDateString();
  };

  const renderComment = (comment, depth = 0, visited) => {
    const commentId = comment.commentId || comment._id || comment.id;
    if (!commentId) return null;
    if (visited?.has?.(commentId)) return null;
    if (depth > 15) return null;
    if (visited?.add) visited.add(commentId);
    const timestamp = formatRelativeTime(comment.createdAt || comment.timestamp) || 'just now';
    const userId = comment.userId ? String(comment.userId) : '';
    const resolved = (userId && (usernamesById[userId] || usernameCache.get(userId))) || null;
    const authorLabel = resolved ? `u/${resolved}` : (userId ? `u/${userId.substring(0, 8)}` : 'u/unknown');
    const isOP = postAuthorId && userId && String(postAuthorId) === String(userId);

    const baseScore = Number(comment.score);
    const score = Number.isNaN(baseScore)
      ? (localScores[commentId] ?? 0)
      : (localScores[commentId] ?? baseScore);
    // Load previous vote from localStorage if not already in state
    const storedVote = localVotes[commentId] ?? getUserCommentVote(commentId);
    const vote = storedVote;

    const persistScoreFallback = async (optimisticScore) => {
      if (commentScoreUpdateSupported === false) return null;
      try {
        const updated = await commentsAPI.update(commentId, { score: optimisticScore });
        commentScoreUpdateSupported = true;
        return updated;
      } catch (err) {
        const msg = String(err?.message || '');
        if (/status:\s*404/i.test(msg) || /\b404\b/.test(msg)) {
          commentScoreUpdateSupported = false;
          return null;
        }
        throw err;
      }
    };

    const handleVote = async (direction) => {
      if (!isLoggedIn() || !getUserToken()) {
        navigate('/login');
        return;
      }

      const prevVote = vote;
      const prevScore = score;
      
      // Toggle: if already voted in this direction, remove vote; otherwise set vote
      const nextVote = prevVote === direction ? null : direction;
      
      // Calculate delta based on previous vote state
      let delta = 0;
      if (direction === 'up') {
        if (prevVote === 'up') {
          delta = -1; // Removing upvote
        } else if (prevVote === 'down') {
          delta = 2; // Switching from down to up
        } else {
          delta = 1; // New upvote
        }
      } else {
        if (prevVote === 'down') {
          delta = 1; // Removing downvote
        } else if (prevVote === 'up') {
          delta = -2; // Switching from up to down
        } else {
          delta = -1; // New downvote
        }
      }
      
      const optimisticScore = prevScore + delta;

      setLocalVotes((prev) => ({ ...prev, [commentId]: nextVote }));
      setLocalScores((prev) => ({ ...prev, [commentId]: optimisticScore }));
      setUserCommentVote(commentId, nextVote); // Persist vote to localStorage

      // Try to update backend (fire and forget)
      try {
        await commentsAPI.update(commentId, { score: optimisticScore });
      } catch (err) {
        console.warn('Failed to sync comment vote to backend:', err);
      }
    };
    
    const indentPx = depth * COMMENT_INDENT_STEP;
    const commentStyle = { marginLeft: `${indentPx}px` };
    const avatarSrc = comment.avatar || comment.userAvatar || comment.authorIcon || DEFAULT_USER_ICON;
    const isCollapsed = collapsedComments[commentId] || false;

    const toggleCollapse = () => {
      setCollapsedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    return (
      <div key={commentId} className={`comment ${isCollapsed ? 'collapsed' : ''}`} style={commentStyle} data-depth={depth}>
        {depth > 0 && (
          <div className="comment-thread-line-vertical">
            <button
              type="button"
              className="comment-collapse-btn reddit-collapse-btn on-thread"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
              title={isCollapsed ? "Expand replies" : "Collapse replies"}
            >
              <span className="collapse-circle">{isCollapsed ? '+' : '–'}</span>
            </button>
          </div>
        )}
        <div className="comment-card reddit-style">
          <div className="comment-header">
            <img
              src={avatarSrc}
              alt=""
              className="comment-avatar"
              onError={(e) => { e.currentTarget.src = DEFAULT_USER_ICON; }}
            />
            <a
              href={userId ? `/user/${userId}` : '#'}
              className="comment-author"
              onClick={(e) => {
                if (!userId) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                navigate(`/user/${userId}`);
              }}
            >
              {authorLabel}
            </a>
            {isOP && <span className="comment-op-tag">OP</span>}
            <span className="comment-separator">•</span>
            <span className="comment-timestamp">{timestamp}</span>
          </div>

          {/* Always show toolbar, only hide body/replies when collapsed */}
          {!isCollapsed && (
            <div className="comment-body">
              <p>{comment.text}</p>
            </div>
          )}

          <div className="comment-toolbar">
            {/* Collapse button for top-level (no thread line) */}
            {depth === 0 && (
              <button
                type="button"
                className="comment-collapse-btn reddit-collapse-btn on-thread"
                onClick={toggleCollapse}
                aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
                title={isCollapsed ? "Expand replies" : "Collapse replies"}
              >
                <span className="collapse-circle">{isCollapsed ? '+' : '–'}</span>
              </button>
            )}
            <div className="comment-vote-group">
              <button
                type="button"
                className={`comment-vote-btn ${vote === 'up' ? 'upvoted' : ''}`}
                onClick={() => handleVote('up')}
                aria-label="Upvote"
              >
                ▲
              </button>
              <span className={`comment-vote-score ${vote === 'up' ? 'upvoted' : vote === 'down' ? 'downvoted' : ''}`}>
                {score}
              </span>
              <button
                type="button"
                className={`comment-vote-btn ${vote === 'down' ? 'downvoted' : ''}`}
                onClick={() => handleVote('down')}
                aria-label="Downvote"
              >
                ▼
              </button>
            </div>
            <button
              className="comment-action-btn"
              onClick={() => toggleReply(commentId)}
            >
              💬 Reply
            </button>
            <button className="comment-action-btn">
              🏆 Award
            </button>
            <button className="comment-action-btn">
              ↗ Share
            </button>
            <button className="comment-more-btn">⋯</button>
          </div>

          {/* Reply form only if not collapsed */}
          {!isCollapsed && expandedComments[commentId] && (
            <div className="reply-form">
              <textarea
                className="reply-textarea"
                placeholder="What are your thoughts?"
                value={replyDrafts[commentId] || ''}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [commentId]: e.target.value }))}
              />
              <div className="reply-buttons">
                <button 
                  className="reply-cancel"
                  onClick={() => toggleReply(commentId)}
                >
                  Cancel
                </button>
                <button 
                  className="reply-submit"
                  onClick={() => handleSubmitReplyLocal(commentId)}
                >
                  Comment
                </button>
              </div>
            </div>
          )}

          {/* Expand button for collapsed state (optional, handled by thread line button) */}
        </div>

        {/* Only show replies if not collapsed */}
        {!isCollapsed && comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, depth + 1, visited))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-list-container">
      <div className="comments-section">
        {comments.length > 0 ? (
          <div className="comment-list">
            {(() => {
              const visited = new Set();
              return comments.map((comment) => renderComment(comment, 0, visited));
            })()}
          </div>
        ) : (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
