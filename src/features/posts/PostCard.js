import React from 'react';

function PostCard({ title, community, author, votes }) {
  return (
    <article style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
      <div style={{ fontSize: '12px', color: '#555' }}>
        r/{community} • Posted by u/{author}
      </div>
      <h2 style={{ fontSize: '16px', margin: '4px 0' }}>{title}</h2>
      <div style={{ fontSize: '12px', color: '#777' }}>{votes} upvotes</div>
    </article>
  );
}

export default PostCard;
