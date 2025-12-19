// LocalStorage-backed favorites (custom feeds).
// Currently supports favoriting communities.

const STORAGE_KEY = 'favoriteCommunities';

function normalizeCommunityKey(value) {
  if (!value) return '';
  return String(value).replace(/^r\//i, '').trim();
}

export function getFavoriteCommunities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const normalized = list.map(normalizeCommunityKey).filter(Boolean);
    return Array.from(new Set(normalized));
  } catch {
    return [];
  }
}

export function isFavoriteCommunity(communityName) {
  if (!communityName) return false;
  return getFavoriteCommunities().includes(normalizeCommunityKey(communityName));
}

export function addFavoriteCommunity(communityName) {
  if (!communityName) return;
  const key = normalizeCommunityKey(communityName);
  if (!key) return;
  const list = getFavoriteCommunities();
  if (!list.includes(key)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, key]));
  }
}

export function removeFavoriteCommunity(communityName) {
  if (!communityName) return;
  const key = normalizeCommunityKey(communityName);
  const list = getFavoriteCommunities().filter((c) => c !== key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function toggleFavoriteCommunity(communityName) {
  if (!communityName) return false;
  const key = normalizeCommunityKey(communityName);
  if (!key) return false;
  if (isFavoriteCommunity(key)) {
    removeFavoriteCommunity(key);
    return false;
  }
  addFavoriteCommunity(key);
  return true;
}
