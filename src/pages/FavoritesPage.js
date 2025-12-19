import React, { useEffect, useMemo, useState } from 'react';
import './FavoritesPage.css';
import { getFavoriteCommunities, toggleFavoriteCommunity } from '../utils/favorites';
import postsAPI from '../api/postsAPI';
import { navigate } from '../utils/helpers';

function normalizeCommunityKey(value) {
  if (!value) return '';
  return String(value).replace(/^r\//i, '').trim();
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState(getFavoriteCommunities());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const all = await postsAPI.getAll();
        if (!mounted) return;
        setPosts(Array.isArray(all) ? all : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load posts.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const favoritePosts = useMemo(() => {
    if (!favorites.length) return [];
    const favSet = new Set(favorites.map(normalizeCommunityKey));
    return posts.filter((p) => {
      const key = normalizeCommunityKey(p?.subreddit || p?.community || p?.communityName);
      return key && favSet.has(key);
    });
  }, [posts, favorites]);

  const handleToggleFavorite = (communityName) => {
    toggleFavoriteCommunity(communityName);
    setFavorites(getFavoriteCommunities());
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>Favorites feed</h1>
        <p className="subtitle">Posts from your favorite communities.</p>
      </div>

      <div className="favorites-content">
        <div className="favorites-sidebar">
          <div className="favorites-sidebar-title">Favorite communities</div>
          {favorites.length === 0 ? (
            <div className="empty">No favorites yet.</div>
          ) : (
            favorites.map((c) => (
              <div key={c} className="fav-row">
                <button className="fav-link" onClick={() => navigate(`/r/${c}`)}>
                  r/{c}
                </button>
                <button className="fav-remove" onClick={() => handleToggleFavorite(c)} title="Remove">✕</button>
              </div>
            ))
          )}
        </div>

        <div className="favorites-main">
          {loading && <div className="card">Loading…</div>}
          {error && <div className="card error">{error}</div>}

          {!loading && !error && favorites.length > 0 && favoritePosts.length === 0 && (
            <div className="card">No posts yet in your favorite communities.</div>
          )}

          {!loading && !error && favoritePosts.map((post) => (
            <article key={post._id || post.postId} className="post-card">
              <div className="post-top">
                <button className="subreddit" onClick={() => navigate(`/r/${normalizeCommunityKey(post.subreddit || post.community || post.communityName)}`)}>
                  r/{normalizeCommunityKey(post.subreddit || post.community || post.communityName)}
                </button>
                <button className="star" onClick={() => handleToggleFavorite(normalizeCommunityKey(post.subreddit || post.community || post.communityName))} title="Unfavorite">
                  ★
                </button>
              </div>
              <h3 className="title">{post.title}</h3>
              {post.textBody && <p className="excerpt">{post.textBody}</p>}
              <div className="actions">
                <button className="open" onClick={() => navigate(`/r/${normalizeCommunityKey(post.subreddit || post.community || post.communityName)}/comments/${post._id || post.postId}`)}>
                  Open
                </button>
              </div>
            </article>
          ))}

          <div className="card hint">
            Tip: Favorite a community from its page, then come back here.
          </div>
        </div>
      </div>
    </div>
  );
}

export default FavoritesPage;
