import React, { useMemo, useState } from 'react';
import './ForgotPasswordPage.css';
import { listUsers, updateUser } from '../api/usersApi';
import { createPasswordResetToken } from '../utils/passwordReset';
import { navigate } from '../utils/helpers';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [resetLink, setResetLink] = useState('');
  const [resetToken, setResetToken] = useState('');

  const canSubmit = useMemo(() => email.trim().length >= 3, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });
    setResetLink('');
    setResetToken('');

    try {
      const usersResponse = await listUsers({ limit: 1000 });
      const users = usersResponse?.items || usersResponse || [];
      const match = (users || []).find(
        (u) => (u.email || '').toLowerCase() === email.trim().toLowerCase()
      );

      // Security UX: don't reveal whether the email exists.
      if (!match) {
        setStatus({
          type: 'success',
          message: 'If an account exists for that email, a reset link has been sent.',
        });
        return;
      }

      // Ensure user has a password field for demo purposes.
      // If the backend doesn't store passwords, this will be ignored.
      try {
        await updateUser(match._id || match.id, { passwordResetRequestedAt: Date.now() });
      } catch (_) {
        // Ignore backend errors in mock flow.
      }

      const token = createPasswordResetToken({ userId: match._id || match.id, email: match.email });
      const link = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
      setResetLink(link);
      setResetToken(token);
      setStatus({
        type: 'success',
        message: 'Reset link generated (mock email).',
      });
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Failed to request reset.' });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resetLink);
      setStatus({ type: 'success', message: 'Reset link copied to clipboard.' });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1>Forgot password</h1>
        <p className="subtitle">Enter your email to receive a reset link.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <button className="primary" type="submit" disabled={!canSubmit || status.type === 'loading'}>
            {status.type === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>

          {status.type !== 'idle' && (
            <div className={`status ${status.type}`}>{status.message}</div>
          )}

          {resetLink && (
            <div className="reset-link-box">
              <div className="reset-link-title">Mock reset link</div>
              <div className="reset-link-row">
              <a href={resetLink} onClick={(e) => { e.preventDefault(); navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`); }}>
                  {resetLink}
                </a>
              </div>
              <div className="reset-link-actions">
                <button type="button" className="secondary" onClick={copyLink}>Copy</button>
                <button type="button" className="secondary" onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}>
                  Open
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="footer">
          <button type="button" className="link" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
