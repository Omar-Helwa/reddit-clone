import React, { useEffect, useMemo, useState } from 'react';
import './CreatePostPage.css';
import { ensureSeeded, communities } from '../data/mockData';
import { addPost, isJoined, joinCommunity, navigate, getJoinedCommunities } from '../utils/helpers';
import { useCreatePost } from '../hooks/usePosts';

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

  useEffect(() => { ensureSeeded(); }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/(.+?)\/submit/);
    const name = match ? match[1] : null;
    
    // Get joined communities
    const joined = getJoinedCommunities();
    setJoinedCommunities(joined);

    if (name && name !== 'general') {
      // If URL specifies a community, use it
      setCommunityName(name);
      setCanPost(isJoined(name));
      setShowCommunitySelector(false);
    } else {
      // If no community in URL or it's 'general', show selector if user has joined communities
      if (joined.length > 0) {
        setShowCommunitySelector(true);
        setCommunityName('');
        setCanPost(false);
      } else {
        // Fallback to general if no communities joined
        setCommunityName('general');
        setCanPost(isJoined('general'));
        setShowCommunitySelector(false);
      }
    }
  }, []);

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

  const filteredCommunities = joinedCommunities.filter(comm => 
    comm.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (!canPost) {
      setError('You must join this community to post.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload = {
      postId: `${Date.now()}`,
      title: title.trim(),
      author: 'u/demo_user',
      subreddit: communityName,
      type: postType,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
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
      // Create post via API (saves to database)
      const newPost = await createPost(payload);
      
      // Also save to localStorage for fallback display
      addPost(communityName, payload);
      
      navigate(`/r/${communityName}/comments/${newPost.postId}`);
    } catch (err) {
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
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((comm) => {
                  const communityData = communities[comm];
                  return (
                    <button
                      key={comm}
                      className="community-list-item"
                      onClick={() => handleSelectCommunity(comm)}
                    >
                      <div className="community-item-avatar">
                        {communityData?.icon ? (
                          <img src={communityData.icon} alt={comm} />
                        ) : (
                          <div className="avatar-placeholder">{communityData?.name?.charAt(0)}</div>
                        )}
                      </div>
                      <div className="community-item-info">
                        <div className="community-item-name">r/{comm}</div>
                        <div className="community-item-meta">
                          {communityData?.members || '0'} members · Subscribed
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="no-communities">
                  {searchTerm ? 'No communities found' : 'No joined communities'}
                </div>
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
