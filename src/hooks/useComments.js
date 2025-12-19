/**
 * Custom React hook for fetching comments from the API
 * Transforms MongoDB data to component-ready format
 */

import { useState, useEffect } from 'react';
import commentsAPI from '../api/commentsAPI';

/**
 * Transform MongoDB comment document to component format
 * @param {Object} comment - Raw comment from API
 * @returns {Object} Transformed comment ready for components
 */
function transformComment(comment) {
  // Schema only stores userId, not author
  // Author will be displayed from the userId reference
  return {
    commentId: comment._id,
    postId: comment.postId,
    userId: comment.userId,
    text: comment.text,
    
    // Engagement
    upvotes: comment.upvotes || 0,
    downvotes: comment.downvotes || 0,
    score: comment.score || 0,
    
    // Nesting
    parentCommentId: comment.parentCommentId || null,

    // UI nesting
    replies: [],
    
    // Metadata
    createdAt: comment.createdAt,
    
    // UI defaults
    authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png',
  };
}

function buildCommentTree(comments) {
  const list = Array.isArray(comments) ? comments : [];
  const byId = new Map();
  list.forEach((c) => {
    if (c && c.commentId) byId.set(String(c.commentId), { ...c, replies: [] });
  });

  const roots = [];
  byId.forEach((comment) => {
    const parentId = comment.parentCommentId ? String(comment.parentCommentId) : null;
    if (parentId && parentId !== String(comment.commentId) && byId.has(parentId)) {
      const parent = byId.get(parentId);
      parent.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const sortByCreated = (arr) => {
    arr.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });
    arr.forEach((c) => sortByCreated(c.replies));
  };
  sortByCreated(roots);

  return roots;
}

/**
 * Hook to fetch all comments for a specific post
 * @param {string} postId - Post ID (ObjectId)
 * @returns {Object} { comments, loading, error, refetch }
 */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const normalizeId = (id) => (typeof id === 'string' ? id : id?.toString?.() || '');

      // Primary fetch by postId
      const result = await commentsAPI.getByPostId(postId);
      const commentsList = Array.isArray(result) ? result : (result?.items ?? []);

      // If server-side filter returns nothing, fallback to list-all and filter client-side
      let finalComments = commentsList;
      if (commentsList.length === 0) {
        const allResult = await commentsAPI.listAll();
        const allComments = Array.isArray(allResult) ? allResult : (allResult?.items ?? []);
        const filtered = allComments.filter(c => normalizeId(c.postId) === normalizeId(postId));
        finalComments = filtered;
      }

      const transformedComments = finalComments.map(transformComment);
      const tree = buildCommentTree(transformedComments);
      setComments(tree);
    } catch (err) {
      setError(err.message || 'Failed to fetch comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
  };
}

/**
 * Hook to fetch a single comment by ID
 * @param {string} commentId - Comment ID (ObjectId)
 * @returns {Object} { comment, loading, error, refetch }
 */
export function useComment(commentId) {
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComment = async () => {
    if (!commentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.getById(commentId);
      const transformedComment = transformComment(result);
      setComment(transformedComment);
    } catch (err) {
      setError(err.message || 'Failed to fetch comment');
      setComment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComment();
  }, [commentId]);

  return {
    comment,
    loading,
    error,
    refetch: fetchComment,
  };
}

/**
 * Hook to fetch replies to a comment (nested comments)
 * @param {string} commentId - Parent comment ID
 * @returns {Object} { replies, loading, error, refetch }
 */
export function useCommentReplies(commentId) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReplies = async () => {
    if (!commentId) {
      setReplies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.getReplies(commentId);
      const transformedReplies = result.map(transformComment);
      setReplies(transformedReplies);
    } catch (err) {
      setError(err.message || 'Failed to fetch replies');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [commentId]);

  return {
    replies,
    loading,
    error,
    refetch: fetchReplies,
  };
}

/**
 * Hook to create a new comment on a post
 * @returns {Object} { createComment, loading, error }
 */
export function useCreateComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createComment = async (postId, commentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.create(postId, commentData);
      const transformedComment = transformComment(result);
      return transformedComment;
    } catch (err) {
      setError(err.message || 'Failed to create comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComment,
    loading,
    error,
  };
}

/**
 * Hook to create a reply to a comment (nested comment)
 * @returns {Object} { createReply, loading, error }
 */
export function useCreateCommentReply() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReply = async (parentCommentId, replyData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.createReply(parentCommentId, replyData);
      const transformedComment = transformComment(result);
      return transformedComment;
    } catch (err) {
      setError(err.message || 'Failed to create reply');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReply,
    loading,
    error,
  };
}

/**
 * Hook to upvote/downvote a comment
 * @returns {Object} { upvoteComment, downvoteComment, loading, error }
 */
export function useCommentVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const upvoteComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.upvote(commentId);
      return transformComment(result);
    } catch (err) {
      setError(err.message || 'Failed to upvote comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downvoteComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await commentsAPI.downvote(commentId);
      return transformComment(result);
    } catch (err) {
      setError(err.message || 'Failed to downvote comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    upvoteComment,
    downvoteComment,
    loading,
    error,
  };
}
