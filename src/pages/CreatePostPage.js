import React, { useEffect, useMemo, useState } from 'react';
import './CreatePostPage.css';
import { ensureSeeded } from '../data/mockData';
import { addPost, isJoined, joinCommunity, navigate } from '../utils/helpers';

function CreatePostPage() {
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

  useEffect(() => { ensureSeeded(); }, []);

  useEffect(() => {
    const path = window.location.pathname;
    // Expect: /r/:name/submit or fallback to general
    const match = path.match(/\/r\/(.+?)\/submit/);
    const name = match ? match[1] : 'general';
    setCommunityName(name);
    setCanPost(isJoined(name));
  }, []);

  const remaining = useMemo(() => Math.max(0, 300 - title.length), [title]);

  const isValidUrl = (value) => /^https?:\/\//i.test(value.trim());

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

  const handleSubmit = (e) => {
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
      title: title.trim(),
      author: 'u/demo_user',
      type: postType
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
      if (!imageUrl.trim() || !isValidUrl(imageUrl)) {
        setError('Enter a valid image URL (must start with http or https).');
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

    const newPost = addPost(communityName, payload);
    navigate(`/r/${communityName}/comments/${newPost.id}`);
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Create a post</h1>
          <span className="community-chip">r/{communityName}</span>
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
              <input
                type="url"
                className="title-input"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!canPost}
              />
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

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/r/${communityName}`)}>Cancel</button>
            <button type="submit" className="post-btn" disabled={!canPost}>Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
