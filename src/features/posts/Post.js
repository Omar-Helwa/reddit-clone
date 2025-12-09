import React from 'react';
import './Post.css';

const Post = ({ 
  postId, 
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
  onUpvote,
  onDownvote
}) => {
  return (
    <article className="post-card" data-post-id={postId}>
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
          <span className="subreddit-name">{subreddit}</span>
          <span className="separator">•</span>
          <span className="post-timestamp">{timestamp}</span>
        </div>
        <div className="post-menu">
          {/* Overflow menu button */}
          <button aria-label="More options" className="menu-button">
            ⋯
          </button>
        </div>
      </div>

      {/* Post Title */}
      <a href={`/r/${subreddit}/comments/${postId}`} className="post-title-link">
        <h2 className="post-title">{title}</h2>
      </a>

      {/* Post Text Body */}
      {textBody && (
        <div className="post-text-body">
          <p>{textBody}</p>
        </div>
      )}

      {/* Post Action Bar */}
      <div className="post-action-bar">
        <button 
          className="action-button upvote-button"
          onClick={onUpvote}
          aria-label="Upvote"
        >
          <span className="icon">⬆</span>
          <span className="score">{score}</span>
        </button>
        
        <button 
          className="action-button downvote-button"
          onClick={onDownvote}
          aria-label="Downvote"
        >
          <span className="icon">⬇</span>
        </button>
        
        <button 
          className="action-button comment-button"
          onClick={onCommentClick}
          aria-label="Comments"
        >
          <span className="icon">💬</span>
          <span className="count">{commentCount}</span>
        </button>
        
        <button 
          className="action-button share-button"
          aria-label="Share"
        >
          <span className="icon">🔗</span>
        </button>
        
        <button 
          className="action-button award-button"
          aria-label="Award"
        >
          <span className="icon">🎁</span>
        </button>
      </div>
    </article>
  );
};

export default Post;
