import React, { useEffect, useRef, useState } from 'react';
import './CommentList.css';

const CommentList = ({ postId, comments = [], onSubmitNewComment, onSubmitReply, autoFocus = false }) => {
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const toggleReply = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSubmitComment = (commentId = null) => {
    if (!newComment.trim()) return;
    if (commentId && typeof onSubmitReply === 'function') {
      onSubmitReply(commentId, newComment);
    } else if (typeof onSubmitNewComment === 'function') {
      onSubmitNewComment(newComment);
    } else {
      console.log('Submit comment:', { postId, parentCommentId: commentId, text: newComment });
    }
    setNewComment('');
  };

  const renderComment = (comment, depth = 0) => {
    const commentId = comment.commentId || comment._id || comment.id;
    const timestamp = comment.createdAt 
      ? new Date(comment.createdAt).toLocaleDateString()
      : comment.timestamp || 'just now';
    // Display userId as author since schema only stores userId
    const author = comment.author || `User ${comment.userId?.substring(0, 8) || 'Unknown'}`;
    
    return (
      <div key={commentId} className="comment" style={{ marginLeft: `${depth * 24}px` }}>
        <div className="comment-header">
          <a href={`/u/${author}`} className="comment-author">
            {author}
          </a>
          <span className="comment-score">{comment.score} points</span>
          <span className="comment-timestamp">{timestamp}</span>
        </div>

        <div className="comment-body">
          <p>{comment.text}</p>
        </div>

        <div className="comment-actions">
          <button className="action-button upvote">⬆ {comment.score}</button>
          <button className="action-button downvote">⬇</button>
          <button 
            className="action-button reply"
            onClick={() => toggleReply(commentId)}
          >
            Reply
          </button>
        </div>

        {expandedComments[comment.id] && (
          <div className="reply-form">
            <textarea
              className="reply-textarea"
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="reply-buttons">
              <button 
                className="reply-submit"
                onClick={() => handleSubmitComment(commentId)}
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

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
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
            onClick={() => handleSubmitComment()}
          >
            Comment
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          <div className="comment-list">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
