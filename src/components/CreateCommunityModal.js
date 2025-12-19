import React, { useState, useEffect, useCallback } from 'react';
import './CreateCommunityModal.css';
import { createCommunity } from '../api/communitiesApi';
import { uploadCommunityImage } from '../api/uploadsApi';
import { joinCommunity } from '../utils/helpers';

function CreateCommunityModal({ isOpen, onClose, onNavigate }) {
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [createdCommunity, setCreatedCommunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    nsfw: false,
    topics: [],
    description: '',
    icon: '',
    banner: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const topics = [
    { id: 'anime', label: 'Anime & Cosplay', emoji: '🎭' },
    { id: 'art', label: 'Art', emoji: '🎨' },
    { id: 'business', label: 'Business & Finance', emoji: '💼' },
    { id: 'collectibles', label: 'Collectibles & Other Hobbies', emoji: '🎯' },
    { id: 'education', label: 'Education & Career', emoji: '🎓' },
    { id: 'fashion', label: 'Fashion & Beauty', emoji: '💄' },
    { id: 'food', label: 'Food & Drinks', emoji: '🍔' },
    { id: 'games', label: 'Games', emoji: '🎮' },
    { id: 'health', label: 'Health', emoji: '💚' },
    { id: 'home', label: 'Home & Garden', emoji: '🏡' },
    { id: 'humanities', label: 'Humanities & Law', emoji: '⚖️' },
    { id: 'identity', label: 'Identity & Relationships', emoji: '💜' },
    { id: 'internet', label: 'Internet Culture', emoji: '🌐' },
    { id: 'movies', label: 'Movies & TV', emoji: '🎬' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'nature', label: 'Nature & Outdoors', emoji: '🌿' },
    { id: 'news', label: 'News & Politics', emoji: '📰' },
    { id: 'places', label: 'Places & Travel', emoji: '✈️' },
    { id: 'popculture', label: 'Pop Culture', emoji: '⭐' },
    { id: 'qna', label: 'Q&As & Stories', emoji: '💬' },
    { id: 'reading', label: 'Reading & Writing', emoji: '📚' },
    { id: 'sciences', label: 'Sciences', emoji: '🔬' },
    { id: 'spooky', label: 'Spooky', emoji: '👻' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'technology', label: 'Technology', emoji: '💻' },
    { id: 'vehicles', label: 'Vehicles', emoji: '🚗' },
    { id: 'wellness', label: 'Wellness', emoji: '🧘' },
    { id: 'adult', label: 'Adult Content', emoji: '🔞' },
    { id: 'mature', label: 'Mature Topics', emoji: '⚠️' }
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleTopic = (topicId) => {
    const newTopics = formData.topics.includes(topicId)
      ? formData.topics.filter(t => t !== topicId)
      : [...formData.topics, topicId];
    handleInputChange('topics', newTopics);
    
    // Auto-enable NSFW if adult/mature topics selected
    if (topicId === 'adult' || topicId === 'mature') {
      if (newTopics.includes('adult') || newTopics.includes('mature')) {
        handleInputChange('nsfw', true);
      }
    }
  };

  // Handle icon upload
  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setUploadingIcon(true);

    try {
      const iconUrl = await uploadCommunityImage(file);
      setFormData(prev => ({ ...prev, icon: iconUrl }));
    } catch (err) {
      setError(err.message || 'Failed to upload icon');
    } finally {
      setUploadingIcon(false);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setUploadingBanner(true);

    try {
      const bannerUrl = await uploadCommunityImage(file);
      setFormData(prev => ({ ...prev, banner: bannerUrl }));
    } catch (err) {
      setError(err.message || 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await createCommunity({
        name: `r/${formData.name}`,
        displayName: formData.name,
        description: formData.description,
        icon: formData.icon || '',
        banner: formData.banner || '',
        type: formData.type === 'public' ? 'Public' : formData.type === 'restricted' ? 'Restricted' : 'Private',
        nsfw: formData.nsfw,
        topics: formData.topics,
        members: 1,
        online: 1,
      });
      joinCommunity(formData.name);
      setCreatedCommunity({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        banner: formData.banner
      });
      setStep(5); // Success step
      setShowConfetti(true);
    } catch (err) {
      setError(err.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.topics.length > 0;
    if (step === 2) return true; // Type is always selected
    if (step === 3) return formData.name.length >= 3 && formData.name.length <= 21 && formData.description.length > 0;
    return true;
  };

  const handleClose = useCallback(() => {
    setStep(1);
    setShowConfetti(false);
    setCreatedCommunity(null);
    setFormData({
      name: '',
      type: 'public',
      nsfw: false,
      topics: [],
      description: '',
      icon: '',
      banner: ''
    });
    setError('');
    setUploadingIcon(false);
    setUploadingBanner(false);
    onClose();
  }, [onClose]);

  const goToCommunity = () => {
    if (createdCommunity && onNavigate) {
      onNavigate('community', `/r/${createdCommunity.name}`);
    }
    handleClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Confetti component
  const Confetti = () => {
    const colors = ['#FF4500', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B', '#C780FA'];
    const confettiPieces = [];
    
    for (let i = 0; i < 100; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.random() * 360}deg)`
      };
      const shapeClass = Math.random() > 0.5 ? 'confetti-square' : 'confetti-diamond';
      confettiPieces.push(
        <div key={i} className={`confetti-piece ${shapeClass}`} style={style} />
      );
    }
    
    return <div className="confetti-container">{confettiPieces}</div>;
  };

  return (
    <div className="create-community-overlay" onClick={handleClose}>
      <div className="create-community-modal" onClick={(e) => e.stopPropagation()}>
        {showConfetti && <Confetti />}
        
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose}>
          <svg viewBox="0 0 20 20" width="20" height="20">
            <path fill="currentColor" d="M11.414 10l4.293-4.293a1 1 0 0 0-1.414-1.414L10 8.586 5.707 4.293a1 1 0 0 0-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 1 0 1.414 1.414L10 11.414l4.293 4.293a1 1 0 0 0 1.414-1.414L11.414 10z"/>
          </svg>
        </button>

        {/* Step 1: Topics */}
        {step === 1 && (
          <div className="modal-content">
            <h2 className="modal-title">What will your community be about?</h2>
            <p className="modal-subtitle">Choose a topic to help redditors discover your community</p>
            
            <div className="topics-grid">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  className={`topic-chip ${formData.topics.includes(topic.id) ? 'selected' : ''}`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <span className="topic-emoji">{topic.emoji}</span>
                  <span className="topic-label">{topic.label}</span>
                </button>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="step-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={handleClose}>Cancel</button>
              <button 
                className="modal-btn primary" 
                onClick={() => setStep(2)}
                disabled={!isStepValid()}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Community Type */}
        {step === 2 && (
          <div className="modal-content">
            <h2 className="modal-title">What kind of community is this?</h2>
            <p className="modal-subtitle">
              Decide who can view and contribute in your community. <strong>Important:</strong> Once set, you will need to submit a request to change your community type.
            </p>
            
            <div className="type-options">
              <label className={`type-option ${formData.type === 'public' ? 'selected' : ''}`}>
                <div className="type-icon">
                  <svg viewBox="0 0 20 20" width="20" height="20">
                    <path fill="currentColor" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-5h2v2H9v-2zm0-8h2v6H9V5z"/>
                  </svg>
                </div>
                <div className="type-content">
                  <strong>Public</strong>
                  <p>Anyone can view, post, and comment to this community</p>
                </div>
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={formData.type === 'public'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <span className="radio-circle"></span>
              </label>

              <label className={`type-option ${formData.type === 'restricted' ? 'selected' : ''}`}>
                <div className="type-icon">
                  <svg viewBox="0 0 20 20" width="20" height="20">
                    <path fill="currentColor" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm5-10h-4V4H9v4H5v2h4v4h2v-4h4V8z"/>
                  </svg>
                </div>
                <div className="type-content">
                  <strong>Restricted</strong>
                  <p>Anyone can view, but only approved users can contribute</p>
                </div>
                <input
                  type="radio"
                  name="type"
                  value="restricted"
                  checked={formData.type === 'restricted'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <span className="radio-circle"></span>
              </label>

              <label className={`type-option ${formData.type === 'private' ? 'selected' : ''}`}>
                <div className="type-icon">
                  <svg viewBox="0 0 20 20" width="20" height="20">
                    <path fill="currentColor" d="M16 9V7c0-3.309-2.691-6-6-6S4 3.691 4 7v2c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2zM6 7c0-2.206 1.794-4 4-4s4 1.794 4 4v2H6V7zm10 11H4v-7h12v7zm-5-3v2H9v-2h2z"/>
                  </svg>
                </div>
                <div className="type-content">
                  <strong>Private</strong>
                  <p>Only approved users can view and contribute</p>
                </div>
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={formData.type === 'private'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <span className="radio-circle"></span>
              </label>
            </div>

            {/* Mature content warning if mature topics selected */}
            {(formData.topics.includes('adult') || formData.topics.includes('mature')) && (
              <div className="mature-warning">
                <p className="mature-text">
                  Community marked as Mature (18+) because you selected a mature topic
                </p>
                <label className="mature-toggle">
                  <div className="toggle-content">
                    <span className="toggle-icon">🔞</span>
                    <div>
                      <strong>Mature (18+)</strong>
                      <p>Users must be over 18 to view and contribute</p>
                    </div>
                  </div>
                  <div className={`toggle-switch ${formData.nsfw ? 'active' : ''}`}>
                    <span className="toggle-knob"></span>
                  </div>
                </label>
              </div>
            )}

            <p className="terms-text">
              By continuing, you agree to our <a href="/content-policy">Mod Code of Conduct</a> and acknowledge that you understand the <a href="/reddit-rules">Reddit Rules</a>.
            </p>

            {/* Pagination dots */}
            <div className="step-dots">
              <span className="dot"></span>
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setStep(1)}>Back</button>
              <button className="modal-btn primary" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Name & Description */}
        {step === 3 && (
          <div className="modal-content">
            <h2 className="modal-title">Tell us about your community</h2>
            <p className="modal-subtitle">A name and description help people understand what your community is all about.</p>
            
            <div className="form-with-preview">
              <div className="form-fields">
                <div className="input-group">
                  <label htmlFor="community-name">Community name *</label>
                  <input
                    type="text"
                    id="community-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder=""
                    maxLength="21"
                  />
                  <span className="char-count">{formData.name.length}/21</span>
                </div>

                <div className="input-group">
                  <label htmlFor="community-desc">Description*</label>
                  <textarea
                    id="community-desc"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder=""
                    rows="6"
                  />
                  <span className="char-count">{formData.description.length}</span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="preview-card">
                <div className="preview-banner" style={formData.banner ? { backgroundImage: `url(${formData.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  <label className="edit-banner-btn" title="Upload banner">
                    {uploadingBanner ? '...' : (
                      <svg viewBox="0 0 20 20" width="16" height="16">
                        <path fill="currentColor" d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828zM4 4v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V8.414l-2-2V16H6V6h5.586l2-2H6a2 2 0 0 0-2 2z"/>
                      </svg>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="preview-content">
                  <div className="preview-avatar">
                    <div className="avatar-circle">
                      {formData.icon ? (
                        <img src={formData.icon} alt="Community icon" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <svg viewBox="0 0 20 20" width="32" height="32">
                          <circle cx="10" cy="10" r="10" fill="#FF4500"/>
                          <circle cx="10" cy="8" r="4" fill="white"/>
                          <path d="M4 16c0-3 3-5.5 6-5.5s6 2.5 6 5.5" fill="white"/>
                        </svg>
                      )}
                    </div>
                    <label className="edit-avatar-btn" title="Upload icon">
                      {uploadingIcon ? '...' : (
                        <svg viewBox="0 0 20 20" width="12" height="12">
                          <path fill="currentColor" d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z"/>
                        </svg>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleIconUpload}
                        disabled={uploadingIcon}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <h3 className="preview-name">r/{formData.name || 'communityname'}</h3>
                  <p className="preview-stats">1 weekly visitor · 1 weekly contributor</p>
                  <p className="preview-desc">{formData.description || 'Your community description'}</p>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Pagination dots */}
            <div className="step-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot active"></span>
              <span className="dot"></span>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setStep(2)}>Back</button>
              <button 
                className="modal-btn primary" 
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success with Confetti */}
        {step === 5 && createdCommunity && (
          <div className="modal-content success-content">
            <h2 className="success-title">You launched a new community!</h2>
            
            {/* Success Preview Card */}
            <div className="success-preview-card">
              <div className="success-banner" style={createdCommunity.banner ? { backgroundImage: `url(${createdCommunity.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              </div>
              <div className="success-content-inner">
                <div className="success-avatar">
                  {createdCommunity.icon ? (
                    <img src={createdCommunity.icon} alt="Community icon" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <svg viewBox="0 0 20 20" width="40" height="40">
                      <circle cx="10" cy="10" r="10" fill="#FF4500"/>
                      <circle cx="10" cy="8" r="4" fill="white"/>
                      <path d="M4 16c0-3 3-5.5 6-5.5s6 2.5 6 5.5" fill="white"/>
                    </svg>
                  )}
                </div>
                <h3 className="success-name">r/{createdCommunity.name}</h3>
                <p className="success-stats">1 weekly visitor · 1 weekly contributor</p>
                <p className="success-desc">{createdCommunity.description}</p>
              </div>
            </div>

            <button className="go-to-community-btn" onClick={goToCommunity}>
              Go To Community Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateCommunityModal;
