import React, { useMemo, useState } from 'react';
import './ResetPasswordPage.css';
import { validatePasswordResetToken, markPasswordResetTokenUsed } from '../utils/passwordReset';
import { updateUser } from '../api/usersApi';
import { navigate } from '../utils/helpers';

function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || '';
}

function ResetPasswordPage() {
  const [token] = useState(getTokenFromUrl());
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const tokenState = useMemo(() => validatePasswordResetToken(token), [token]);
  const canSubmit = useMemo(() => {
    if (!tokenState.valid) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [tokenState.valid, password, confirm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus({ type: 'loading', message: '' });
    try {
      const userId = tokenState.entry.userId;
      await updateUser(userId, { password });
      markPasswordResetTokenUsed(token);
      setStatus({ type: 'success', message: 'Password updated. You can now log in.' });
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Failed to reset password.' });
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h1>Reset password</h1>

        {!tokenState.valid ? (
          <div className="status error">
            This reset link is invalid or expired.
            <div className="actions">
              <button className="secondary" type="button" onClick={() => navigate('/forgot-password')}>
                Request a new link
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="subtitle">Choose a new password for {tokenState.entry.email}.</p>

            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              <button className="primary" type="submit" disabled={!canSubmit || status.type === 'loading'}>
                {status.type === 'loading' ? 'Saving…' : 'Reset password'}
              </button>

              {status.type !== 'idle' && (
                <div className={`status ${status.type}`}>{status.message}</div>
              )}

              {status.type === 'success' && (
                <div className="actions">
                  <button type="button" className="secondary" onClick={() => navigate('/login')}>
                    Go to login
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
