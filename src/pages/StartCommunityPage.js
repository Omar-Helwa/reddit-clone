import React, { useState } from 'react';
import './StartCommunityPage.css';
import { createCommunity } from '../api/communitiesApi';
import { joinCommunity } from '../utils/helpers';

function StartCommunityPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    displayName: '',
    nsfw: false,
    category: '',
    description: '',
    icon: '',
    banner: '',
    rules: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'art', label: 'Art & Design', icon: '🎨' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'other', label: 'Other', icon: '📌' }
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newCommunity = await createCommunity({
        name: `r/${formData.name}`,
        displayName: formData.displayName || formData.name,
        description: formData.description,
        icon: formData.icon,
        banner: formData.banner,
        type: formData.type === 'public' ? 'Public' : 'Private',
        rules: formData.rules,
        members: 1,
        online: 1,
      });
      joinCommunity(formData.name);
      alert(`Community r/${formData.name} created successfully!`);
      if (onNavigate) {
        onNavigate('community', `/r/${formData.name}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create community');
      console.error('Error creating community:', err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.name.length >= 3 && formData.name.length <= 21;
    if (step === 2) return formData.category !== '';
    if (step === 3) return formData.description.length >= 10;
    return true;
  };

  return (
    <div className="start-community-page">
      <div className="start-community-header">
        <h1>🚀 Start a Community</h1>
        <p>Build and grow a community about something you care about</p>
      </div>

      <div className="start-community-container">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Name</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Category</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Details</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="community-form">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="form-step">
              <h2>Choose a name for your community</h2>
              <p className="step-description">
                Community names cannot be changed. Choose wisely!
              </p>

              <div className="form-group">
                <label htmlFor="name">Community Name</label>
                <div className="name-input-wrapper">
                  <span className="name-prefix">r/</span>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="community_name"
                    maxLength="21"
                    required
                  />
                </div>
                <div className="input-hint">
                  {formData.name.length}/21 characters • Letters, numbers, and underscores only
                </div>
              </div>

              <div className="form-group">
                <label>Community Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      checked={formData.type === 'public'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    />
                    <div className="radio-content">
                      <span className="radio-icon">👁️</span>
                      <div>
                        <strong>Public</strong>
                        <p>Anyone can view, post, and comment</p>
                      </div>
                    </div>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="type"
                      value="restricted"
                      checked={formData.type === 'restricted'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    />
                    <div className="radio-content">
                      <span className="radio-icon">🔓</span>
                      <div>
                        <strong>Restricted</strong>
                        <p>Anyone can view, but only approved can post</p>
                      </div>
                    </div>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      checked={formData.type === 'private'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    />
                    <div className="radio-content">
                      <span className="radio-icon">🔒</span>
                      <div>
                        <strong>Private</strong>
                        <p>Only approved members can view and post</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.nsfw}
                    onChange={(e) => handleInputChange('nsfw', e.target.checked)}
                  />
                  <span>18+ (NSFW) community</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div className="form-step">
              <h2>Select a category</h2>
              <p className="step-description">
                This helps people find your community
              </p>

              <div className="category-grid">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-card ${formData.category === cat.id ? 'selected' : ''}`}
                    onClick={() => handleInputChange('category', cat.id)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="form-step">
              <h2>Add community details</h2>
              <p className="step-description">
                Help people understand what your community is about
              </p>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell people what your community is all about..."
                  rows="5"
                  maxLength="500"
                  required
                />
                <div className="input-hint">
                  {formData.description.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="form-step">
              <h2>Review your community</h2>
              <p className="step-description">
                Make sure everything looks good before creating
              </p>

              <div className="review-card">
                <div className="review-item">
                  <strong>Name:</strong>
                  <span>r/{formData.name}</span>
                </div>
                <div className="review-item">
                  <strong>Type:</strong>
                  <span className="capitalize">{formData.type}</span>
                </div>
                <div className="review-item">
                  <strong>Category:</strong>
                  <span className="capitalize">
                    {categories.find(c => c.id === formData.category)?.label || 'None'}
                  </span>
                </div>
                <div className="review-item">
                  <strong>Description:</strong>
                  <p>{formData.description}</p>
                </div>
                <div className="review-item">
                  <strong>NSFW:</strong>
                  <span>{formData.nsfw ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="terms-notice">
                <p>
                  By creating a community, you agree to Reddit's Community Rules and Moderator Code of Conduct.
                </p>
              </div>

              {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {step > 1 && (
              <button
                type="button"
                className="nav-btn secondary"
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                className="nav-btn primary"
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="nav-btn primary submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartCommunityPage;
