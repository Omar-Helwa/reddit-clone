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
  onSubredditClick,
  onUpvote,
  onDownvote
}) => {
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
            <span className="post-meta">Posted by u/{author}</span>
            <span className="separator">•</span>
            <span className="post-timestamp">{timestamp}</span>
          </div>
          <div className="post-menu">
            <button aria-label="Save" className="menu-button">🔖</button>
            <button aria-label="More options" className="menu-button">⋯</button>
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
          >
            <span className="icon">↗</span>
            <span className="count">Share</span>
          </button>
          
          <button 
            className="action-button award-button"
            aria-label="Award"
          >
            <span className="icon">🏆</span>
            <span className="count">Award</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default Post;
