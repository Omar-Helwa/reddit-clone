import React, { useEffect, useMemo, useState } from 'react';
import './CreatePostPage.css';
import { isJoined, joinCommunity, navigate, getJoinedCommunities } from '../utils/helpers';
import { useCreatePost } from '../hooks/usePosts';
import useCommunities from '../hooks/useCommunities';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';
import { getCurrentUserId } from '../utils/auth';

function CreatePostPage() {
  const { createPost, loading: creatingPost, error: createError } = useCreatePost();
  const [communityName, setCommunityName] = useState('');
  const [canPost, setCanPost] = useState(false);
  const [title, setTitle] = useState('');
  const [textBody, setTextBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' }
  ]);
  const [postType, setPostType] = useState('text');
  const [error, setError] = useState('');
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const { communities: communityList, loading: communitiesLoading } = useCommunities(200);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/(.+?)\/submit/);
    const name = match ? match[1] : null;

    const joined = getJoinedCommunities();
    setJoinedCommunities(joined);

    if (name && name !== 'general') {
      setCommunityName(name);
      setCanPost(isJoined(name));
      setShowCommunitySelector(false);
    } else {
      setShowCommunitySelector(true);
      setCommunityName('');
      setCanPost(false);
    }
  }, []);

  const normalizeCommunityName = (value) => (value || '').replace(/^r\//, '');

  const remaining = useMemo(() => Math.max(0, 300 - title.length), [title]);

  const isValidUrl = (value) => /^https?:\/\//i.test(value.trim());
  const isValidImageInput = (value) => {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed);
  };

  const handlePollOptionChange = (id, value) => {
    setPollOptions((opts) => opts.map(o => o.id === id ? { ...o, text: value } : o));
  };

  const addPollOption = () => {
    setPollOptions((opts) => [...opts, { id: Date.now(), text: '' }]);
  };

  const removePollOption = (id) => {
    setPollOptions((opts) => opts.length <= 2 ? opts : opts.filter(o => o.id !== id));
  };

  const handleJoin = () => {
    joinCommunity(communityName);
    setCanPost(true);
  };

  const handleSelectCommunity = (community) => {
    setCommunityName(community);
    setCanPost(true);
    setShowCommunitySelector(false);
    setSearchTerm('');
  };

  const filteredCommunities = (() => {
    const joinedSet = new Set((joinedCommunities || []).map(normalizeCommunityName));
    const base = communityList.length > 0
      ? communityList.filter((c) => joinedSet.has(normalizeCommunityName(c.name)) || joinedSet.has(normalizeCommunityName(c.displayName)))
      : joinedCommunities.map((name) => ({ name }));

    return base.filter((comm) => {
      const value = (comm.name || comm.displayName || '').toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  })();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImageUrl(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please drop an image file');
      }
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select an image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Backend requires JWT token for creating posts
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You are signed in without a token. Please log in again to create posts.');
      navigate('/login');
      return;
    }

    if (!canPost) {
      setError('You must join this community to post.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (postType === 'text' && !textBody.trim()) {
      setError('Post body is required for text posts.');
      return;
    }

    const subredditValue = (communityName || '').replace(/^r\//i, '');
    const userId = getCurrentUserId();

    if (!userId) {
      setError('You must be logged in to post.');
      return;
    }

    const payload = {
      title: title.trim(),
      userId,
      subreddit: subredditValue,
      type: postType,
      // optional but accepted by backend
      upvotes: 0,
      downvotes: 0,
      score: 0,
      commentCount: 0,
    };

    if (postType === 'text') {
      payload.textBody = textBody.trim();
    }

    if (postType === 'link') {
      if (!linkUrl.trim() || !isValidUrl(linkUrl)) {
        setError('Enter a valid link (must start with http or https).');
        return;
      }
      payload.linkUrl = linkUrl.trim();
      payload.textBody = textBody.trim();
    }

    if (postType === 'image') {
      if (!isValidImageInput(imageUrl)) {
        setError('Please upload an image or provide a valid image URL.');
        return;
      }
      payload.imageUrl = imageUrl.trim();
      payload.textBody = textBody.trim();
    }

    if (postType === 'poll') {
      const normalized = pollOptions
        .map(o => ({ ...o, text: o.text.trim() }))
        .filter(o => o.text.length > 0);
      if (normalized.length < 2) {
        setError('Poll needs at least two options.');
        return;
      }
      payload.pollOptions = normalized.map((o, idx) => ({
        id: `${Date.now()}-${idx}`,
        label: o.text,
        votes: 0
      }));
    }

    try {
      console.log('Creating post payload:', payload);
      // Create post via API (saves to database)
      const newPost = await createPost(payload);
      console.log('Created post response:', newPost);
      
      navigate(`/r/${communityName}/comments/${newPost.postId}`);
    } catch (err) {
      console.error('Create post failed:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    }
  };

  if (showCommunitySelector) {
    return (
      <div className="create-post-page">
        <div className="create-post-container">
          <h1 className="create-post-title">Create a post</h1>
          
          <div className="community-selector">
            <div className="selector-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="community-search-input"
                placeholder="Select a community"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="community-list">
              {communitiesLoading ? (
                <div className="no-communities">Loading communities...</div>
              ) : joinedCommunities.length === 0 ? (
                <div className="no-communities">
                  <p>You haven’t joined any communities yet.</p>
                  <button type="button" className="post-btn" onClick={() => navigate('/explore')}>Explore communities</button>
                </div>
              ) : filteredCommunities.length > 0 ? (
                filteredCommunities.map((comm) => {
                  const icon = comm.icon || DEFAULT_COMMUNITY_ICON;
                  const display = comm.displayName || comm.name || 'Community';
                  const desc = comm.description || 'No description provided.';
                  return (
                    <button
                      key={comm._id || comm.name}
                      className="community-list-item"
                      onClick={() => handleSelectCommunity(normalizeCommunityName(comm.name || comm.displayName))}
                    >
                      <div className="community-item-avatar">
                        <img src={icon} alt={display} onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }} />
                      </div>
                      <div className="community-item-info">
                        <div className="community-item-name">{display}</div>
                        <div className="community-item-desc">{desc}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="no-communities">No communities found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Create a post</h1>
          <button 
            className="community-chip"
            onClick={() => setShowCommunitySelector(true)}
            title="Change community"
          >
            r/{communityName}
          </button>
        </div>

        {!canPost && (
          <div className="join-gate">
            <p>You must be a member of r/{communityName} to create a post.</p>
            <button className="join-btn" onClick={handleJoin}>+ Join r/{communityName}</button>
          </div>
        )}

        <div className="post-type-tabs">
          {['text','link','image','poll'].map(type => (
            <button
              key={type}
              type="button"
              className={`tab-btn ${postType === type ? 'active' : ''}`}
              onClick={() => setPostType(type)}
              disabled={!canPost}
            >
              {type === 'text' && 'Text'}
              {type === 'link' && 'Link'}
              {type === 'image' && 'Image'}
              {type === 'poll' && 'Poll'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <input 
            type="text" 
            className="title-input" 
            placeholder="Title"
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canPost}
          />
          <div className="title-helper">{remaining} characters remaining</div>

          {postType === 'text' && (
            <textarea 
              className="text-input"
              placeholder="Text (optional)"
              rows={8}
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
              disabled={!canPost}
            />
          )}

          {postType === 'link' && (
            <>
              <input
                type="url"
                className="title-input"
                placeholder="Paste a URL (must start with http/https)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={!canPost}
              />
              <textarea 
                className="text-input"
                placeholder="Optional description"
                rows={5}
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                disabled={!canPost}
              />
            </>
          )}

          {postType === 'image' && (
            <>
              {!imageUrl ? (
                <div 
                  className="image-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="dropzone-content">
                    <span className="dropzone-icon">📁</span>
                    <div className="dropzone-text">
                      <p className="dropzone-main">Drag and Drop or upload media</p>
                      <label className="dropzone-label">
                        Click to upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          style={{ display: 'none' }}
                          disabled={!canPost}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={imageUrl} alt="preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => setImageUrl('')}
                  >
                    ✕
                  </button>
                </div>
              )}
              <textarea 
                className="text-input"
                placeholder="Optional caption"
                rows={5}
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                disabled={!canPost}
              />
            </>
          )}

          {postType === 'poll' && (
            <div className="poll-builder">
              {pollOptions.map((opt, idx) => (
                <div key={opt.id} className="poll-option-row">
                  <input
                    type="text"
                    className="title-input"
                    placeholder={`Option ${idx + 1}`}
                    value={opt.text}
                    onChange={(e) => handlePollOptionChange(opt.id, e.target.value)}
                    disabled={!canPost}
                  />
                  <button
                    type="button"
                    className="remove-option"
                    onClick={() => removePollOption(opt.id)}
                    disabled={!canPost || pollOptions.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-option"
                onClick={addPollOption}
                disabled={!canPost}
              >
                + Add option
              </button>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}
          {createError && <div className="error-msg">{createError}</div>}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/r/${communityName}`)} disabled={creatingPost}>Cancel</button>
            <button type="submit" className="post-btn" disabled={!canPost || creatingPost}>
              {creatingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
