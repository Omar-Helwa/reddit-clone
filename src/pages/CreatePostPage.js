import React, { useEffect, useMemo, useState, useRef } from 'react';
import './CreatePostPage.css';
import { isJoined, joinCommunity, navigate, getJoinedCommunities } from '../utils/helpers';
import { useCreatePost } from '../hooks/usePosts';
import useCommunities from '../hooks/useCommunities';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';
import { getCurrentUserId, getCurrentUser } from '../utils/auth';

function CreatePostPage() {
  const { createPost, loading: creatingPost, error: createError } = useCreatePost();
  const [communityName, setCommunityName] = useState('');
  const [canPost, setCanPost] = useState(false);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' }
  ]);
  const [postType, setPostType] = useState('text');
  const [error, setError] = useState('');
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tags, setTags] = useState({
    nsfw: false,
    spoiler: false,
    brandAffiliate: false
  });

  const { communities: communityList, loading: communitiesLoading } = useCommunities(200);
  const currentUser = getCurrentUser();

  const normalizeCommunityName = (value) => (value || '').replace(/^r\//, '').trim();

  const joinedSet = useMemo(() => {
    const list = (joinedCommunities || []).map(normalizeCommunityName);
    return new Set(list.filter((c) => c && c !== 'general'));
  }, [joinedCommunities]);

  const dbJoinedCommunities = useMemo(() => {
    const list = Array.isArray(communityList) ? communityList : [];
    if (list.length === 0) return [];
    return list.filter((c) => {
      const name = normalizeCommunityName(c?.name);
      const displayName = normalizeCommunityName(c?.displayName);
      return (name && joinedSet.has(name)) || (displayName && joinedSet.has(displayName));
    });
  }, [communityList, joinedSet]);

  const isCommunityAllowed = useMemo(() => {
    const allowed = new Set(
      dbJoinedCommunities
        .map((c) => normalizeCommunityName(c?.name || c?.displayName))
        .filter(Boolean)
    );
    return (slug) => {
      const s = normalizeCommunityName(slug);
      if (!s || s === 'general') return false;
      return allowed.has(s);
    };
  }, [dbJoinedCommunities]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/(.+?)\/submit/);
    const name = match ? match[1] : null;

    const joined = getJoinedCommunities();
    setJoinedCommunities(joined);

    const normalized = normalizeCommunityName(name);
    if (normalized && normalized !== 'general' && isJoined(normalized)) {
      setCommunityName(normalized);
      setCanPost(true);
      return;
    }

    setCommunityName('');
    setCanPost(false);
  }, []);

  useEffect(() => {
    if (!communityName) return;
    if (communitiesLoading) return;
    if (!isCommunityAllowed(communityName)) {
      setCommunityName('');
      setCanPost(false);
    }
  }, [communityName, communitiesLoading, isCommunityAllowed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.community-selector-wrapper')) {
        setShowCommunityDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    const normalized = normalizeCommunityName(community);
    if (!isCommunityAllowed(normalized)) {
      setError('Please choose a community you have already joined.');
      return;
    }
    setError('');
    setCommunityName(normalized);
    setCanPost(true);
    setShowCommunityDropdown(false);
    setSearchTerm('');
  };

  const handleSelectProfile = () => {
    // For posting to user profile (not implemented yet)
    setShowCommunityDropdown(false);
  };

  const filteredCommunities = useMemo(() => {
    const base = dbJoinedCommunities;
    return base.filter((comm) => {
      const value = (comm.name || comm.displayName || '').toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  }, [dbJoinedCommunities, searchTerm]);

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

  // Convert HTML to plain text for saving
  const htmlToPlainText = (html) => {
    if (!html) return '';
    
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get text content (strips all HTML tags)
    let text = temp.textContent || temp.innerText || '';
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  // Get plain text from editor for saving
  const getEditorPlainText = () => {
    if (editorRef.current) {
      return htmlToPlainText(editorRef.current.innerHTML);
    }
    return '';
  };

  // Rich text formatting using execCommand for WYSIWYG
  const applyFormat = (format) => {
    // Focus the editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    switch (format) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'strike':
        document.execCommand('strikeThrough', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'superscript':
        document.execCommand('superscript', false, null);
        break;
      case 'subscript':
        document.execCommand('subscript', false, null);
        break;
      case 'heading':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'code':
        // Wrap selection in code tag
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const code = document.createElement('code');
          code.style.backgroundColor = '#f0f0f0';
          code.style.padding = '2px 6px';
          code.style.borderRadius = '4px';
          code.style.fontFamily = 'monospace';
          range.surroundContents(code);
        }
        break;
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false, null);
        break;
      case 'numlist':
        document.execCommand('insertOrderedList', false, null);
        break;
      case 'spoiler':
        // Create spoiler span
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const spoiler = document.createElement('span');
          spoiler.className = 'spoiler-text';
          spoiler.style.backgroundColor = '#545452';
          spoiler.style.color = '#545452';
          spoiler.style.padding = '0 4px';
          spoiler.style.borderRadius = '4px';
          spoiler.style.cursor = 'pointer';
          spoiler.onclick = (e) => {
            e.target.style.color = 'inherit';
            e.target.style.backgroundColor = 'transparent';
          };
          range.surroundContents(spoiler);
        }
        break;
      case 'table':
        const tableHtml = `<table style="border-collapse: collapse; width: 100%; margin: 8px 0;">
          <tr><th style="border: 1px solid #ddd; padding: 8px;">Header</th><th style="border: 1px solid #ddd; padding: 8px;">Header</th></tr>
          <tr><td style="border: 1px solid #ddd; padding: 8px;">Cell</td><td style="border: 1px solid #ddd; padding: 8px;">Cell</td></tr>
        </table>`;
        document.execCommand('insertHTML', false, tableHtml);
        break;
      default:
        break;
    }
  };

  // Prevent button from stealing focus
  const handleToolbarMouseDown = (e) => {
    e.preventDefault();
  };

  // Reference for contentEditable div
  const editorRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('You are signed in without a token. Please log in again to create posts.');
      navigate('/login');
      return;
    }

    if (!communityName || normalizeCommunityName(communityName) === 'general') {
      setError('You must choose a community.');
      return;
    }
    if (!isCommunityAllowed(communityName)) {
      setError('Please choose a community you have already joined.');
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

    // Get plain text from the editor
    const plainTextBody = getEditorPlainText();

    if (postType === 'text' && !plainTextBody.trim()) {
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
      subreddit: subredditValue,
      type: postType,
    };

    if (postType === 'text') {
      payload.textBody = plainTextBody.trim();
    }

    if (postType === 'link') {
      if (!linkUrl.trim() || !isValidUrl(linkUrl)) {
        setError('Enter a valid link (must start with http or https).');
        return;
      }
      payload.linkUrl = linkUrl.trim();
      if (plainTextBody.trim()) payload.textBody = plainTextBody.trim();
    }

    if (postType === 'image') {
      if (!isValidImageInput(imageUrl)) {
        setError('Please upload an image or provide a valid image URL.');
        return;
      }
      payload.imageUrl = imageUrl.trim();
      if (plainTextBody.trim()) payload.textBody = plainTextBody.trim();
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
      const newPost = await createPost(payload);
      navigate(`/r/${subredditValue}/comments/${newPost.postId}`);
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    }
  };

  const selectedCommunity = useMemo(() => {
    if (!communityName) return null;
    return dbJoinedCommunities.find(c => 
      normalizeCommunityName(c.name) === communityName || 
      normalizeCommunityName(c.displayName) === communityName
    );
  }, [communityName, dbJoinedCommunities]);

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        {/* Header */}
        <div className="create-post-header">
          <h1>Create post</h1>
          <button className="drafts-btn">Drafts</button>
        </div>

        {/* Community Selector */}
        <div className="community-selector-wrapper" onClick={(e) => e.stopPropagation()}>
          {showCommunityDropdown ? (
            <div className="community-selector-search">
              <svg viewBox="0 0 20 20" width="18" height="18">
                <path fill="currentColor" d="M15.5 14h-.8l-.3-.3c1-1.1 1.6-2.6 1.6-4.2 0-3.6-2.9-6.5-6.5-6.5S3 5.9 3 9.5 5.9 16 9.5 16c1.6 0 3.1-.6 4.2-1.6l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0C7 14 5 12 5 9.5S7 5 9.5 5 14 7 14 9.5 12 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Select a community"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <button 
              className="community-selector-btn"
              onClick={() => setShowCommunityDropdown(true)}
            >
              {communityName ? (
                <>
                  <img 
                    src={selectedCommunity?.icon || DEFAULT_COMMUNITY_ICON} 
                    alt="" 
                    className="selector-icon"
                    onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                  />
                  <span className="selector-text">r/{communityName}</span>
                </>
              ) : (
                <>
                  <svg className="selector-icon-svg" viewBox="0 0 20 20" width="20" height="20">
                    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 4.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  <span className="selector-text">Select a community</span>
                </>
              )}
              <svg className="selector-chevron" viewBox="0 0 20 20" width="16" height="16">
                <path fill="currentColor" d="M5 8l5 5 5-5z"/>
              </svg>
            </button>
          )}

          {showCommunityDropdown && (
            <div className="community-dropdown">
              <div className="dropdown-list">
                {/* User Profile Option */}
                {currentUser && (
                  <button className="dropdown-item profile-item" onClick={handleSelectProfile}>
                    <div className="item-avatar">
                      <img 
                        src={currentUser.avatar || DEFAULT_COMMUNITY_ICON} 
                        alt=""
                        onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                      />
                    </div>
                    <div className="item-info">
                      <span className="item-name">u/{currentUser.username}</span>
                      <span className="item-meta">Your profile</span>
                    </div>
                  </button>
                )}

                {/* Communities */}
                {communitiesLoading ? (
                  <div className="dropdown-empty">Loading communities...</div>
                ) : filteredCommunities.length > 0 ? (
                  filteredCommunities.map((comm) => (
                    <button
                      key={comm._id || comm.name}
                      className="dropdown-item"
                      onClick={() => handleSelectCommunity(normalizeCommunityName(comm.name || comm.displayName))}
                    >
                      <div className="item-avatar">
                        <img 
                          src={comm.icon || DEFAULT_COMMUNITY_ICON} 
                          alt=""
                          onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                        />
                      </div>
                      <div className="item-info">
                        <span className="item-name">r/{normalizeCommunityName(comm.name || comm.displayName)}</span>
                        <span className="item-meta">{comm.members?.toLocaleString() || '1'} members · Subscribed</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="dropdown-empty">No communities found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Join Gate */}
        {communityName && !canPost && (
          <div className="join-gate">
            <p>You must be a member of r/{communityName} to create a post.</p>
            <button className="join-btn" onClick={handleJoin}>+ Join r/{communityName}</button>
          </div>
        )}

        {/* Post Type Tabs */}
        <div className="post-type-tabs">
          <button
            className={`tab-btn ${postType === 'text' ? 'active' : ''}`}
            onClick={() => setPostType('text')}
          >
            Text
          </button>
          <button
            className={`tab-btn ${postType === 'image' ? 'active' : ''}`}
            onClick={() => setPostType('image')}
          >
            Images & Video
          </button>
          <button
            className={`tab-btn ${postType === 'link' ? 'active' : ''}`}
            onClick={() => setPostType('link')}
          >
            Link
          </button>
          <button
            className={`tab-btn ${postType === 'poll' ? 'active' : ''}`}
            onClick={() => setPostType('poll')}
          >
            Poll
          </button>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Title Input */}
          <div className="title-wrapper">
            <input 
              type="text" 
              className="title-input" 
              placeholder="Title*"
              maxLength={300}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="title-counter">{title.length}/300</span>
          </div>

          {/* Add Tags Button */}
          <button type="button" className="add-tags-btn" onClick={() => setShowTagsModal(true)}>
            Add tags
            {(tags.nsfw || tags.spoiler || tags.brandAffiliate) && (
              <span className="tags-count">
                {[tags.nsfw, tags.spoiler, tags.brandAffiliate].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Image/Video Upload Area */}
          {postType === 'image' && (
            <>
              {!imageUrl ? (
                <div 
                  className="media-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <span>Drag and Drop or upload media</span>
                  <label className="upload-btn">
                    <svg viewBox="0 0 20 20" width="16" height="16">
                      <path fill="currentColor" d="M10 3v10M5 8l5-5 5 5"/>
                    </svg>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                  </label>
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
            </>
          )}

          {/* Link URL Input */}
          {postType === 'link' && (
            <div className="link-input-wrapper">
              <input
                type="url"
                className="link-input"
                placeholder="Link URL *"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          )}

          {/* Rich Text Editor */}
          <div className="rich-editor">
            <div className="editor-toolbar" onMouseDown={handleToolbarMouseDown}>
              <button type="button" onClick={() => applyFormat('bold')} title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" onClick={() => applyFormat('italic')} title="Italic">
                <em>i</em>
              </button>
              <button type="button" onClick={() => applyFormat('strike')} title="Strikethrough">
                <s>S</s>
              </button>
              <button type="button" onClick={() => applyFormat('superscript')} title="Superscript">
                X<sup>2</sup>
              </button>
              <button type="button" onClick={() => applyFormat('heading')} title="Heading">
                TT
              </button>
              <span className="toolbar-divider"></span>
              <button type="button" onClick={() => applyFormat('link')} title="Link">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M11 3a4 4 0 0 1 4 4v1h-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1h2v1a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h4z"/>
                </svg>
              </button>
              <button type="button" title="Image">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v5l3-2 2 2 4-4 3 3V6H4zm2 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
              </button>
              <button type="button" title="Emoji">😊</button>
              <button type="button" onClick={() => applyFormat('list')} title="Bullet List">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M3 4h2v2H3V4zm4 0h10v2H7V4zM3 9h2v2H3V9zm4 0h10v2H7V9zm-4 5h2v2H3v-2zm4 0h10v2H7v-2z"/>
                </svg>
              </button>
              <button type="button" onClick={() => applyFormat('numlist')} title="Numbered List">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M3 4h2v4H4V5H3V4zm0 6h2.5l-2 2v1H6v-1H4l2-2V9H3v1zm0 5h1v1h1v1H3v-1h1v-1H3v-1zm5-11h9v2H8V4zm0 5h9v2H8V9zm0 5h9v2H8v-2z"/>
                </svg>
              </button>
              <span className="toolbar-divider"></span>
              <button type="button" onClick={() => applyFormat('quote')} title="Quote">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M6 6H3v4h3V6zm0 4c0 2-1 3-3 4l1 1c3-1 4-3 4-5V6H6v4zM14 6h-3v4h3V6zm0 4c0 2-1 3-3 4l1 1c3-1 4-3 4-5V6h-1v4z"/>
                </svg>
              </button>
              <button type="button" onClick={() => applyFormat('code')} title="Code">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M7 5L2 10l5 5 1.4-1.4L4.8 10l3.6-3.6L7 5zm6 0l-1.4 1.4L15.2 10l-3.6 3.6L13 15l5-5-5-5z"/>
                </svg>
              </button>
              <button type="button" onClick={() => applyFormat('spoiler')} title="Spoiler">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M10 4C5 4 1 10 1 10s4 6 9 6 9-6 9-6-4-6-9-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              </button>
              <button type="button" onClick={() => applyFormat('table')} title="Table">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M3 3v14h14V3H3zm6 12H5v-4h4v4zm0-6H5V5h4v4zm6 6h-4v-4h4v4zm0-6h-4V5h4v4z"/>
                </svg>
              </button>
              <button type="button" className="more-btn" title="More">···</button>
              {(postType === 'image' || postType === 'link') && (
                <button type="button" className="markdown-toggle">Switch to Markdown</button>
              )}
            </div>
            <div
              ref={editorRef}
              className="body-editor"
              contentEditable
              data-placeholder="Body text (optional)"
              suppressContentEditableWarning={true}
            />
          </div>

          {/* Poll Builder */}
          {postType === 'poll' && (
            <div className="poll-builder">
              {pollOptions.map((opt, idx) => (
                <div key={opt.id} className="poll-option-row">
                  <input
                    type="text"
                    className="poll-input"
                    placeholder={`Option ${idx + 1}`}
                    value={opt.text}
                    onChange={(e) => handlePollOptionChange(opt.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className="remove-option"
                    onClick={() => removePollOption(opt.id)}
                    disabled={pollOptions.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="add-option" onClick={addPollOption}>
                + Add option
              </button>
            </div>
          )}

          {/* Error Messages */}
          {error && <div className="error-msg">{error}</div>}
          {createError && <div className="error-msg">{createError}</div>}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="save-draft-btn">Save Draft</button>
            <button type="button" className="schedule-btn" title="Schedule">
              <svg viewBox="0 0 20 20" width="20" height="20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 5v5l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button type="submit" className="post-btn" disabled={creatingPost}>
              {creatingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Tags Modal */}
        {showTagsModal && (
          <div className="tags-modal-overlay" onClick={() => setShowTagsModal(false)}>
            <div className="tags-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tags-modal-header">
                <h2>Add tags</h2>
                <button className="tags-modal-close" onClick={() => setShowTagsModal(false)}>
                  <svg viewBox="0 0 20 20" width="20" height="20">
                    <path fill="currentColor" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                  </svg>
                </button>
              </div>
              <div className="tags-modal-body">
                <div className="tag-option">
                  <div className="tag-icon nsfw-icon">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <text x="10" y="14" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">18</text>
                    </svg>
                  </div>
                  <div className="tag-info">
                    <span className="tag-name">Not Safe For Work (NSFW)</span>
                    <span className="tag-desc">Contains mature or adult content</span>
                  </div>
                  <label className="tag-toggle">
                    <input 
                      type="checkbox" 
                      checked={tags.nsfw} 
                      onChange={(e) => setTags(prev => ({ ...prev, nsfw: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="tag-option">
                  <div className="tag-icon spoiler-icon">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                      <path fill="currentColor" d="M10 2L2 10l8 8 8-8-8-8zm0 3l5 5-5 5-5-5 5-5z"/>
                    </svg>
                  </div>
                  <div className="tag-info">
                    <span className="tag-name">Spoiler</span>
                    <span className="tag-desc">May ruin a surprise</span>
                  </div>
                  <label className="tag-toggle">
                    <input 
                      type="checkbox" 
                      checked={tags.spoiler} 
                      onChange={(e) => setTags(prev => ({ ...prev, spoiler: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="tag-option">
                  <div className="tag-icon brand-icon">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                      <path fill="currentColor" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 9h2v2H6V9zm6 0h2v2h-2V9zM7 12h6c0 1.66-1.34 3-3 3s-3-1.34-3-3z"/>
                    </svg>
                  </div>
                  <div className="tag-info">
                    <span className="tag-name">Brand affiliate</span>
                    <span className="tag-desc">Made for a brand or business</span>
                  </div>
                  <label className="tag-toggle">
                    <input 
                      type="checkbox" 
                      checked={tags.brandAffiliate} 
                      onChange={(e) => setTags(prev => ({ ...prev, brandAffiliate: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="tags-modal-footer">
                <button type="button" className="tags-cancel-btn" onClick={() => setShowTagsModal(false)}>
                  Cancel
                </button>
                <button type="button" className="tags-add-btn" onClick={() => setShowTagsModal(false)}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="create-post-footer">
          <a href="/content-policy">Reddit Rules</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/user-agreement">User Agreement</a>
          <a href="/accessibility">Accessibility</a>
          <span className="footer-dot">•</span>
          <span className="copyright">Reddit, Inc. © 2025. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
