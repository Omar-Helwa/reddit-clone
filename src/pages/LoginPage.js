import React, { useState } from 'react';
import './LoginPage.css';
import { signInWithGoogle } from '../utils/googleOAuth';
import { setCurrentUser } from '../utils/auth';

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const { setCurrentUser } = await import('../utils/auth');
        const { loginUser } = await import('../api/usersApi');

        const usernameOrEmail = formData.username.trim();
        const password = formData.password;

        // Call API to validate credentials against DB
        const authResult = await loginUser(usernameOrEmail, password);

        // Expected shape: { user, token }
        if (!authResult?.user) {
          throw new Error('Login response missing user');
        }

        if (!authResult?.token) {
        }

        const userToStore = {
          ...authResult.user,
          token: authResult.token,
        };

        setCurrentUser(userToStore);

        // Redirect to home page
        window.location.href = '/';
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Login failed. Please try again.'
        }));
      }
    }
  };

  const handleGoogleLogin = () => {
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
        setCurrentUser(user);
        window.location.href = '/';
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || 'Google login failed. Please try again.',
        }));
      }
    })();
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple OAuth
    alert('Apple login will be implemented');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-branding">
            <h1>Welcome back</h1>
            <p>Log in to continue your journey with communities you love</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <h2>Log In</h2>
            <p className="login-subtitle">
              New to Reddit Clone? <a href="/signup" className="signup-link">Sign Up</a>
            </p>

            <div className="social-login">
              <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                <span className="social-icon">🔍</span>
                Continue with Google
              </button>
              <button className="social-btn apple-btn" onClick={handleAppleLogin}>
                <span className="social-icon"></span>
                Continue with Apple
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
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
                    placeholder="Enter your password"
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
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              </div>

              {errors.submit && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                  {errors.submit}
                </div>
              )}
              
              <button type="submit" className="submit-btn">Log In</button>
            </form>

            <div className="login-footer">
              <p>
                By continuing, you agree to our <a href="/user-agreement">User Agreement</a> and acknowledge that you understand the <a href="/privacy">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
