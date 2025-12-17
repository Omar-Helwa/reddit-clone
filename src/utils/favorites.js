// LocalStorage-backed favorites (custom feeds).
// Currently supports favoriting communities.

const STORAGE_KEY = 'favoriteCommunities';

export function getFavoriteCommunities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavoriteCommunity(communityName) {
  if (!communityName) return false;
  return getFavoriteCommunities().includes(communityName);
}

export function addFavoriteCommunity(communityName) {
  if (!communityName) return;
  const list = getFavoriteCommunities();
  if (!list.includes(communityName)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, communityName]));
  }
}

export function removeFavoriteCommunity(communityName) {
  if (!communityName) return;
  const list = getFavoriteCommunities().filter((c) => c !== communityName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function toggleFavoriteCommunity(communityName) {
  if (!communityName) return false;
  if (isFavoriteCommunity(communityName)) {
    removeFavoriteCommunity(communityName);
    return false;
  }
  addFavoriteCommunity(communityName);
  return true;
}
