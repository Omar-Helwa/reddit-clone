/**
 * EXAMPLE: How to use Comments API and Hooks
 * Use this structure in your post detail/comments component
 */

import React, { useState } from 'react';
import { useComments, useCreateComment, useCommentVote } from '../../hooks/useComments';

const CommentSection = ({ postId }) => {
  const { comments, loading, error, refetch } = useComments(postId);
  const { createComment, loading: creating } = useCreateComment();
  const { upvoteComment, downvoteComment } = useCommentVote();
  const [newCommentText, setNewCommentText] = useState('');

  const handleCreateComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      await createComment(postId, {
        author: 'current_user', // TODO: Get from auth context
        text: newCommentText,
      });
      setNewCommentText('');
      refetch(); // Refresh comments
    } catch (err) {
    }
  };

  const handleUpvoteComment = async (commentId) => {
    try {
      await upvoteComment(commentId);
      refetch();
    } catch (err) {
    }
  };

  const handleDownvoteComment = async (commentId) => {
    try {
      await downvoteComment(commentId);
      refetch();
    } catch (err) {
    }
  };

  if (loading) {
    return <div className="comments">Loading comments...</div>;
  }

  if (error) {
    return (
      <div className="comments">
        <p>Error: {error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="comments">
      {/* Comment Input */}
      <div className="comment-input">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          rows="3"
        />
        <button onClick={handleCreateComment} disabled={creating || !newCommentText.trim()}>
          {creating ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentId} className="comment">
              <div className="comment-header">
                <img src={comment.authorIcon} alt={comment.author} className="author-icon" />
                <span className="author">{comment.author}</span>
                <span className="timestamp">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-actions">
                <button onClick={() => handleUpvoteComment(comment.commentId)}>
                  👍 {comment.upvotes}
                </button>
                <button onClick={() => handleDownvoteComment(comment.commentId)}>
                  👎 {comment.downvotes}
                </button>
                <button>↩️ Reply</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
