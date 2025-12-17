import React, { useState } from 'react';
import './SignupPage.css';
import { signInWithGoogle } from '../utils/googleOAuth';
import { setCurrentUser } from '../utils/auth';

function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username) => {
    // Username must be 3-20 characters, alphanumeric and underscores only
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Import API client and auth utils
        const { createUser } = await import('../api/usersApi');
        const { setCurrentUser } = await import('../utils/auth');
        
        // Create new user in MongoDB
        const newUser = await createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          image: '', // Optional: add avatar upload later
        });
        
        console.log('User created successfully:', newUser);
        
        // Save user info to localStorage
        setCurrentUser(newUser);
        
        alert(`Welcome ${formData.username}! Your account has been created.`);
        
        // Redirect to home page after successful signup (user is now logged in)
        window.location.href = '/';
      } catch (error) {
        console.error('Signup failed:', error);
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to create account. Please try again.'
        }));
      }
    }
  };

  const handleGoogleSignup = () => {
    (async () => {
      try {
        const payload = await signInWithGoogle();
        const email = payload.email || '';
        const username = (email && email.includes('@')) ? email.split('@')[0] : (payload.name || 'google_user');
        const user = {
          _id: payload.sub ? `google-${payload.sub}` : `google-${Date.now()}`,
          username,
          email,
          image: payload.picture || '',
        };

        // Try to create the user in the backend if available; fall back to local session.
        try {
          const { createUser } = await import('../api/usersApi');
          const created = await createUser({
            username: user.username,
            email: user.email,
            password: `google-oauth-${user._id}`,
            image: user.image,
          });
          setCurrentUser(created);
        } catch (_) {
          setCurrentUser(user);
        }

        window.location.href = '/';
      } catch (error) {
        console.error('Google signup failed:', error);
        setErrors((prev) => ({
          ...prev,
          submit: error.message || 'Google signup failed. Please try again.',
        }));
      }
    })();
  };

  const handleAppleSignup = () => {
    console.log('Apple signup clicked');
    // TODO: Implement Apple OAuth
    alert('Apple signup will be implemented');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <div className="signup-branding">
            <h1>Join Reddit Clone</h1>
            <p>Discover communities, share ideas, and connect with people who share your interests</p>
            <div className="features">
              <div className="feature-item">✓ 100K+ active communities</div>
              <div className="feature-item">✓ Real-time discussions</div>
              <div className="feature-item">✓ Free to join</div>
            </div>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-box">
            <h2>Create Account</h2>
            <p className="signup-subtitle">
              Already a Redditor? <a href="/login" className="login-link">Log In</a>
            </p>

            <div className="social-signup">
              <button className="social-btn google-btn" onClick={handleGoogleSignup}>
                <span className="social-icon">🔍</span>
                Continue with Google
              </button>
              <button className="social-btn apple-btn" onClick={handleAppleSignup}>
                <span className="social-icon"></span>
                Continue with Apple
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
                <span className="helper-text">This will be your public display name</span>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={errors.password ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
                <span className="helper-text">At least 8 characters with uppercase, lowercase, and number</span>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the <a href="/user-agreement" target="_blank" rel="noopener noreferrer">User Agreement</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
              </div>

              {errors.submit && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                  {errors.submit}
                </div>
              )}
              
              <button type="submit" className="submit-btn">Sign Up</button>
            </form>

            <div className="signup-footer">
              <p>
                By creating an account, you'll be able to vote, comment, create posts, and join communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
