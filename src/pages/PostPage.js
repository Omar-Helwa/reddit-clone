import React, { useEffect, useMemo, useState } from 'react';
import './PostPage.css';
import CommentList from '../features/comments/CommentList';
import { ensureSeeded } from '../data/mockData';
import { getPostById, addComment, votePollOption } from '../utils/helpers';

function PostPage() {
  const [communityName, setCommunityName] = useState('');
  const [postId, setPostId] = useState('');
  const [post, setPost] = useState(null);
  const [focusComment, setFocusComment] = useState(false);

  useEffect(() => { ensureSeeded(); }, []);

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

  useEffect(() => {
    if (communityName && postId) {
      const p = getPostById(communityName, postId);
      setPost(p || null);
    }
  }, [communityName, postId]);

  const comments = useMemo(() => (post?.comments || []), [post]);

  const totalPollVotes = useMemo(() => {
    if (!post?.pollOptions) return 0;
    return post.pollOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  }, [post]);

  const handleSubmitNewComment = (text) => {
    if (!text?.trim()) return;
    addComment(communityName, postId, text.trim());
    const updated = getPostById(communityName, postId);
    setPost(updated);
  };

  const handleVote = (optionId) => {
    votePollOption(communityName, postId, optionId);
    const updated = getPostById(communityName, postId);
    setPost(updated);
  };

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
            <div className="subreddit">r/{post.subreddit}</div>
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
        </article>

        <section className="comments-section-full">
          <CommentList 
            postId={post.id} 
            comments={comments} 
            onSubmitNewComment={handleSubmitNewComment}
            autoFocus={focusComment}
          />
        </section>
      </div>
    </div>
  );
}

export default PostPage;
