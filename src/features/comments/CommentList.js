import React, { useEffect, useRef, useState } from 'react';
import './CommentList.css';
import { getUser } from '../../api/usersApi';
import { navigate } from '../../utils/helpers';
import commentsAPI from '../../api/commentsAPI';
import { getUserToken, isLoggedIn } from '../../utils/auth';
import { DEFAULT_USER_ICON } from '../../utils/placeholders';

let commentVoteEndpointsSupported = null; // null | true | false
let commentScoreUpdateSupported = null; // null | true | false

const COMMENT_INDENT_STEP = 28; // px between each nesting rail

const usernameCache = new Map(); // userId -> username

const CommentList = ({ postId, comments = [], onSubmitNewComment, onSubmitReply, autoFocus = false }) => {
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const textareaRef = useRef(null);
  const [usernamesById, setUsernamesById] = useState({});
  const [localVotes, setLocalVotes] = useState({}); // commentId -> 'up' | 'down' | null
  const [localScores, setLocalScores] = useState({}); // commentId -> number

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

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

  const handleSubmitNew = () => {
    if (!newComment.trim()) return;
    if (typeof onSubmitNewComment === 'function') {
      onSubmitNewComment(newComment);
    } else {
      console.log('Submit comment:', { postId, parentCommentId: null, text: newComment });
    }
    setNewComment('');
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

    const baseScore = Number(comment.score);
    const score = Number.isNaN(baseScore)
      ? (localScores[commentId] ?? 0)
      : (localScores[commentId] ?? baseScore);
    const vote = localVotes[commentId] ?? null;

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
      const nextVote = prevVote === direction ? null : direction;
      const delta = direction === 'up'
        ? (prevVote === 'up' ? -1 : (prevVote === 'down' ? 2 : 1))
        : (prevVote === 'down' ? 1 : (prevVote === 'up' ? -2 : -1));
      const optimisticScore = prevScore + delta;

      setLocalVotes((prev) => ({ ...prev, [commentId]: nextVote }));
      setLocalScores((prev) => ({ ...prev, [commentId]: optimisticScore }));

      if (commentVoteEndpointsSupported === false) {
        try {
          const updated = await persistScoreFallback(optimisticScore);
          const nextScore = Number(updated?.score);
          if (!Number.isNaN(nextScore)) {
            setLocalScores((prev) => ({ ...prev, [commentId]: nextScore }));
          }
        } catch {
          setLocalVotes((prev) => ({ ...prev, [commentId]: prevVote }));
          setLocalScores((prev) => ({ ...prev, [commentId]: prevScore }));
        }
        return;
      }

      try {
        const updated = direction === 'up'
          ? await commentsAPI.upvote(commentId)
          : await commentsAPI.downvote(commentId);
        commentVoteEndpointsSupported = true;
        const nextScore = Number(updated?.score);
        if (!Number.isNaN(nextScore)) {
          setLocalScores((prev) => ({ ...prev, [commentId]: nextScore }));
        }
        setLocalVotes((prev) => ({ ...prev, [commentId]: direction }));
      } catch (err) {
        const msg = String(err?.message || '');
        if (/status:\s*404/i.test(msg) || /\b404\b/.test(msg)) {
          commentVoteEndpointsSupported = false;
          try {
            const updated = await persistScoreFallback(optimisticScore);
            const nextScore = Number(updated?.score);
            if (!Number.isNaN(nextScore)) {
              setLocalScores((prev) => ({ ...prev, [commentId]: nextScore }));
            }
          } catch {
            setLocalVotes((prev) => ({ ...prev, [commentId]: prevVote }));
            setLocalScores((prev) => ({ ...prev, [commentId]: prevScore }));
          }
          return;
        }

        setLocalVotes((prev) => ({ ...prev, [commentId]: prevVote }));
        setLocalScores((prev) => ({ ...prev, [commentId]: prevScore }));
      }
    };
    
    const indentPx = depth * COMMENT_INDENT_STEP;
    const commentStyle = { marginLeft: `${indentPx}px` };
    const avatarSrc = comment.avatar || comment.userAvatar || comment.authorIcon || DEFAULT_USER_ICON;

    return (
      <div key={commentId} className="comment" style={commentStyle} data-depth={depth}>
        <div className="comment-thread" aria-hidden="true">
          {depth > 0 && <span className="comment-thread-line" />}
          <span className="comment-thread-node">
            <span className="comment-thread-dot" />
          </span>
        </div>

        <div className="comment-card">
          <div className="comment-header">
            <img
              src={avatarSrc}
              alt={authorLabel}
              className="comment-avatar"
              onError={(e) => { e.currentTarget.src = DEFAULT_USER_ICON; }}
            />
            <div className="comment-header-text">
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
              <span className="comment-timestamp">{timestamp}</span>
            </div>
            <span className="comment-score-chip">{score} pts</span>
          </div>

          <div className="comment-body">
            <p>{comment.text}</p>
          </div>

          <div className="comment-toolbar">
            <div className="comment-vote-group" aria-label="Comment voting">
              <button
                type="button"
                className={`comment-toolbar-btn vote ${vote === 'up' ? 'active' : ''}`}
                onClick={() => handleVote('up')}
                aria-label="Upvote comment"
              >
                ▲
              </button>
              <span className={`comment-vote-score ${vote === 'up' ? 'upvoted' : vote === 'down' ? 'downvoted' : ''}`}>
                {score}
              </span>
              <button
                type="button"
                className={`comment-toolbar-btn vote ${vote === 'down' ? 'active' : ''}`}
                onClick={() => handleVote('down')}
                aria-label="Downvote comment"
              >
                ▼
              </button>
            </div>
            <button
              className="comment-toolbar-btn reply"
              onClick={() => toggleReply(commentId)}
            >
              Reply
            </button>
          </div>

          {expandedComments[commentId] && (
            <div className="reply-form">
              <textarea
                className="reply-textarea"
                placeholder="What are your thoughts?"
                value={replyDrafts[commentId] || ''}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [commentId]: e.target.value }))}
              />
              <div className="reply-buttons">
                <button 
                  className="reply-submit"
                  onClick={() => handleSubmitReplyLocal(commentId)}
                >
                  Comment
                </button>
                <button 
                  className="reply-cancel"
                  onClick={() => toggleReply(commentId)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, depth + 1, visited))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-list-container">
      <div className="new-comment-form">
        <h3>Comment as User</h3>
        <textarea
          className="comment-textarea"
          placeholder="What are your thoughts?"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          ref={textareaRef}
          rows="4"
        />
        <div className="form-buttons">
          <button 
            className="submit-button"
            onClick={handleSubmitNew}
          >
            Comment
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
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
