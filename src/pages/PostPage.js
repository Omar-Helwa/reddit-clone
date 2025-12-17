import React, { useEffect, useMemo, useState } from 'react';
import './PostPage.css';
import CommentList from '../features/comments/CommentList';
import { navigate } from '../utils/helpers';
import { usePost } from '../hooks/usePosts';
import { useComments, useCreateComment } from '../hooks/useComments';
import { getCurrentUserId, getCurrentUser } from '../utils/auth';
import { summarizePost, isGeminiAvailable } from '../utils/gemini';

function PostPage() {
  const [communityName, setCommunityName] = useState('');
  const [postId, setPostId] = useState('');
  const [focusComment, setFocusComment] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const { post, loading, error, refetch } = usePost(postId);
  const { comments, loading: commentsLoading, error: commentsError, refetch: refetchComments } = useComments(post?._id || post?.postId);
  const { createComment, loading: creatingComment, error: createCommentError } = useCreateComment();

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

  const totalPollVotes = useMemo(() => {
    if (!post?.pollOptions) return 0;
    return post.pollOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  }, [post]);

  const handleSubmitNewComment = async (text) => {
    if (!text?.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    const userId = getCurrentUserId();
    const user = getCurrentUser();
    if (!userId) {
      alert('You must be logged in to comment');
      return;
    }

    try {
      await createComment(post._id || post.postId, {
        userId: userId,
        text: text.trim(),
        parentCommentId: null,
      });
      console.log('Comment created, refetching comments...');
      refetchComments();
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to create comment: ' + err.message);
    }
  };

  const handleVote = () => {
    alert('Poll voting is not yet connected to the API.');
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
    return <div className="post-page"><div className="post-container"><div className="post-card-full">Loading post...</div></div></div>;
  }

  if (error) {
    return (
      <div className="post-page">
        <div className="post-container">
          <div className="post-card-full">
            <p>Failed to load post: {error}</p>
            <button onClick={refetch}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-page">
        <div className="post-container">
          <div className="post-card-full">
            <p>Post not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-container">
        <article className="post-card-full">
          <div className="post-header">
            <button 
              className="subreddit" 
              onClick={() => navigate(`/r/${communityName}`)}
            >
              r/{post.subreddit}
            </button>
            <h1 className="title">{post.title}</h1>
            <div className="meta">Posted by {post.author} • {post.timestamp}</div>
          </div>
          {post.type === 'text' && post.textBody && (
            <div className="post-body">
              <p>{post.textBody}</p>
            </div>
          )}

          {post.type === 'link' && (
            <div className="post-link-card">
              <a href={post.linkUrl} target="_blank" rel="noreferrer" className="link-url">{post.linkUrl}</a>
              {post.textBody && <p className="link-description">{post.textBody}</p>}
            </div>
          )}

          {post.type === 'image' && (
            <div className="post-image-card">
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-image" />}
              {post.textBody && <p className="image-caption">{post.textBody}</p>}
            </div>
          )}

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
        </article>

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
              autoFocus={focusComment}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default PostPage;
