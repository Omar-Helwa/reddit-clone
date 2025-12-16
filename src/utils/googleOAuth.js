const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const json = atob(padded);
  return decodeURIComponent(
    Array.prototype.map
      .call(json, (c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  );
}

function decodeJwt(jwt) {
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Trigger Google Identity Services "One Tap" prompt and resolve with the decoded ID token payload.
 * Requires `REACT_APP_GOOGLE_CLIENT_ID`.
 */
export async function signInWithGoogle() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google OAuth not configured. Set REACT_APP_GOOGLE_CLIENT_ID.');
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity Services unavailable'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const payload = decodeJwt(response?.credential);
        if (!payload) {
          reject(new Error('Failed to decode Google credential'));
          return;
        }
        resolve(payload);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Show prompt.
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        // This can happen when third-party cookies are blocked, or origin isn't authorized.
        // Keep error generic but actionable.
        reject(new Error('Google sign-in was blocked or not available for this origin.'));
      }
    });
  });
}
