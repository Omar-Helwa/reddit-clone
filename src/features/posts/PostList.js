import React, { useMemo } from 'react';
import Post from './Post';
import './PostList.css';
import { navigate } from '../../utils/helpers';
import { usePosts } from '../../hooks/usePosts';

const PostList = ({ sortBy = 'BEST' }) => {
  const { posts, loading, error, refetch } = usePosts();

  console.log('📊 PostList sortBy:', sortBy, 'posts count:', posts?.length);

  const getTimestampMs = (post) => {
    const raw = post?.createdAt || post?.timestamp || post?.created || 0;
    const ms = new Date(raw).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  const sortedPosts = useMemo(() => {
    console.log('🔄 Sorting posts by:', sortBy, 'count:', posts?.length);
    
    const hotRank = (post, exponent = 1.5) => {
      const score = Number(post?.score) || 0;
      const ts = getTimestampMs(post);
      const hoursSince = Math.max(0, (Date.now() - ts) / 3600000);
      return score / Math.pow(hoursSince + 2, exponent);
    };

    const list = Array.isArray(posts) ? posts : [];
    let sorted;
    switch (sortBy) {
      case 'NEW':
        sorted = [...list].sort((a, b) => getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'TOP':
        sorted = [...list].sort(
          (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || getTimestampMs(b) - getTimestampMs(a)
        );
        break;
      case 'RISING':
        sorted = [...list].sort((a, b) => hotRank(b, 1.15) - hotRank(a, 1.15) || getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'HOT':
        sorted = [...list].sort((a, b) => hotRank(b, 1.5) - hotRank(a, 1.5) || getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'BEST':
      default:
        sorted = [...list].sort((a, b) => hotRank(b, 1.35) - hotRank(a, 1.35) || getTimestampMs(b) - getTimestampMs(a));
        break;
    }
    console.log('📋 First 3 sorted:', sorted.slice(0, 3).map(p => ({ title: p.title?.substring(0, 20), score: p.score, time: p.createdAt })));
    return sorted;
  }, [posts, sortBy]);

  const handleCommentClick = (post) => {
    const slug = (post?.subreddit || '').replace(/^r\//, '');
    if (!slug) return;
    navigate(`/r/${slug}/comments/${post.postId}?comment=1`);
  };

  const handleSubredditClick = (subreddit) => {
    const slug = String(subreddit || '').replace(/^r\//, '');
    if (!slug) return;
    navigate(`/r/${slug}`);
  };

  if (loading) {
    return <div className="post-list loading">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="post-list loading">
        <div>Error loading posts: {error}</div>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="post-list-container">
      <div className="post-list">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => {
            const subreddit = post?.subreddit || '';
            const communityKey = subreddit.replace(/^r\//, '');
            const timestamp = post?.createdAt || post?.timestamp;
            return (
              <Post
                key={post?.uniqueKey || post?.postId}
                postId={post?.postId}
                communityKey={communityKey}
                title={post?.title}
                author={post?.author}
                authorId={post?.authorId}
                subreddit={subreddit}
                timestamp={timestamp}
                score={post?.score}
                commentCount={post?.commentCount}
                textBody={post?.textBody}
                authorIcon={post?.authorIcon}
                subredditIcon={post?.subredditIcon}
                onCommentClick={() => handleCommentClick(post)}
                onSubredditClick={() => handleSubredditClick(subreddit)}
              />
            );
          })
        ) : (
          <div className="no-posts">No posts yet.</div>
        )}
      </div>
    </div>
  );
};

export default PostList;
