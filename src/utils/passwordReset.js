// Local (mock) password reset flow.
// NOTE: This app currently has no backend email service.
// We simulate "email" delivery by generating a reset link and storing the token locally.

const STORAGE_KEY = 'passwordResetTokens';
const DEFAULT_TTL_MS = 1000 * 60 * 30; // 30 minutes

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function randomToken() {
  // Not cryptographically secure; OK for mock flow.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createPasswordResetToken({ userId, email, ttlMs = DEFAULT_TTL_MS }) {
  const token = randomToken();
  const store = loadStore();
  store[token] = {
    userId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    used: false,
  };
  saveStore(store);
  return token;
}

export function validatePasswordResetToken(token) {
  if (!token) return { valid: false, reason: 'missing' };
  const store = loadStore();
  const entry = store[token];
  if (!entry) return { valid: false, reason: 'not_found' };
  if (entry.used) return { valid: false, reason: 'used' };
  if (Date.now() > entry.expiresAt) return { valid: false, reason: 'expired' };
  return { valid: true, entry };
}

export function markPasswordResetTokenUsed(token) {
  const store = loadStore();
  if (!store[token]) return;
  store[token].used = true;
  saveStore(store);
}
