const STORAGE_KEY = 'post-awards';

export const AWARD_CATALOG = [
  { id: 'gold', label: 'Gold', icon: '🥇' },
  { id: 'silver', label: 'Silver', icon: '🥈' },
  { id: 'helpful', label: 'Helpful', icon: '💡' },
  { id: 'wholesome', label: 'Wholesome', icon: '✨' },
];

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {}
}

export function getPostAwards(postId) {
  if (!postId) return {};
  const store = readStore();
  const awards = store[String(postId)];
  return awards && typeof awards === 'object' ? awards : {};
}

export function addPostAward(postId, awardId) {
  if (!postId || !awardId) return;
  const store = readStore();
  const key = String(postId);
  const next = { ...(store[key] || {}) };
  next[awardId] = (Number(next[awardId]) || 0) + 1;
  store[key] = next;
  writeStore(store);
}
