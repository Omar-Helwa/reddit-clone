# API & Hooks Quick Reference

## File Structure

```
src/api/
  ├── postsAPI.js       (API calls for posts)
  └── commentsAPI.js    (API calls for comments)

src/hooks/
  ├── usePosts.js       (React hooks for posts)
  └── useComments.js    (React hooks for comments)
```

---

## Posts API (`src/api/postsAPI.js`)

### Available Methods

```javascript
import { postsAPI } from '../api/postsAPI';

// GET all posts
const allPosts = await postsAPI.getAll();

// GET posts by subreddit
const communityPosts = await postsAPI.getBySubreddit('r/hackthebox');

// GET single post by ID
const post = await postsAPI.getById(postId);

// CREATE new post
const newPost = await postsAPI.create({
  title: 'My Post',
  author: 'username',
  subreddit: 'r/hackthebox',
  type: 'text',
  textBody: 'Post content here...'
});

// UPDATE post
const updated = await postsAPI.update(postId, { title: 'Updated Title' });

// DELETE post
await postsAPI.delete(postId);

// UPVOTE post
const upvoted = await postsAPI.upvote(postId);

// DOWNVOTE post
const downvoted = await postsAPI.downvote(postId);

// PIN post
const pinned = await postsAPI.pin(postId);

// UNPIN post
const unpinned = await postsAPI.unpin(postId);
```

---

## Comments API (`src/api/commentsAPI.js`)

### Available Methods

```javascript
import { commentsAPI } from '../api/commentsAPI';

// GET all comments for a post
const comments = await commentsAPI.getByPostId(postId);

// GET single comment
const comment = await commentsAPI.getById(commentId);

// GET replies to a comment
const replies = await commentsAPI.getReplies(commentId);

// CREATE comment on a post
const newComment = await commentsAPI.create(postId, {
  author: 'username',
  text: 'Comment text here...'
});

// CREATE reply to a comment
const reply = await commentsAPI.createReply(parentCommentId, {
  author: 'username',
  text: 'Reply text here...'
});

// UPDATE comment
const updated = await commentsAPI.update(commentId, { text: 'Updated text' });

// DELETE comment
await commentsAPI.delete(commentId);

// UPVOTE comment
const upvoted = await commentsAPI.upvote(commentId);

// DOWNVOTE comment
const downvoted = await commentsAPI.downvote(commentId);
```

---

## Posts Hooks (`src/hooks/usePosts.js`)

### Hook: `usePosts()`
Fetches ALL posts

```javascript
import { usePosts } from '../../hooks/usePosts';

function MyComponent() {
  const { posts, loading, error, refetch } = usePosts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.postId}>{post.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Hook: `usePostsBySubreddit(subreddit)`
Fetches posts from specific community

```javascript
function CommunityPosts() {
  const { posts, loading, error } = usePostsBySubreddit('r/hackthebox');
  // Same usage as usePosts()
}
```

### Hook: `usePost(postId)`
Fetches single post by ID

```javascript
function PostDetail() {
  const { post, loading, error, refetch } = usePost(postId);
  // Same usage pattern
}
```

### Hook: `useCreatePost()`
Creates new post

```javascript
function CreatePostForm() {
  const { createPost, loading, error } = useCreatePost();
  
  const handleSubmit = async (formData) => {
    try {
      const newPost = await createPost({
        title: formData.title,
        author: 'current_user',
        subreddit: 'r/hackthebox',
        type: 'text',
        textBody: formData.content
      });
      console.log('Created:', newPost);
    } catch (err) {
      console.error('Failed:', err);
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Hook: `usePostVote()`
Upvote/downvote posts

```javascript
function PostWithVoting() {
  const { upvotePost, downvotePost, loading, error } = usePostVote();
  
  const handleUpvote = async (postId) => {
    try {
      const updated = await upvotePost(postId);
      console.log('Score:', updated.score);
    } catch (err) {
      console.error('Failed:', err);
    }
  };
  
  return (
    <div>
      <button onClick={() => handleUpvote(postId)} disabled={loading}>
        👍 Upvote
      </button>
    </div>
  );
}
```

---

## Comments Hooks (`src/hooks/useComments.js`)

### Hook: `useComments(postId)`
Fetches all comments for a post

```javascript
import { useComments } from '../../hooks/useComments';

function CommentsSection() {
  const { comments, loading, error, refetch } = useComments(postId);
  
  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.commentId}>{comment.text}</div>
      ))}
    </div>
  );
}
```

### Hook: `useComment(commentId)`
Fetches single comment

```javascript
function CommentDetail() {
  const { comment, loading, error } = useComment(commentId);
  // Same usage as useComments()
}
```

### Hook: `useCommentReplies(commentId)`
Fetches replies to a comment

```javascript
function CommentReplies() {
  const { replies, loading, error } = useCommentReplies(parentCommentId);
  // Same usage pattern
}
```

### Hook: `useCreateComment()`
Creates new comment

```javascript
function CommentForm() {
  const { createComment, loading, error } = useCreateComment();
  
  const handleSubmit = async (text) => {
    try {
      const newComment = await createComment(postId, {
        author: 'current_user',
        text: text
      });
      console.log('Created:', newComment);
    } catch (err) {
      console.error('Failed:', err);
    }
  };
}
```

### Hook: `useCreateCommentReply()`
Creates reply to a comment

```javascript
function ReplyForm() {
  const { createReply, loading, error } = useCreateCommentReply();
  
  const handleSubmit = async (text) => {
    const reply = await createReply(parentCommentId, {
      author: 'current_user',
      text: text
    });
  };
}
```

### Hook: `useCommentVote()`
Upvote/downvote comments

```javascript
function CommentWithVoting() {
  const { upvoteComment, downvoteComment } = useCommentVote();
  
  const handleUpvote = async (commentId) => {
    const updated = await upvoteComment(commentId);
    console.log('New score:', updated.score);
  };
}
```

---

## Data Transformation

All hooks automatically transform MongoDB data to component format:

**Posts transform:**
```javascript
// From API:
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Test Post",
  "upvotes": 5,
  "downvotes": 2
}

// Becomes:
{
  "postId": "507f1f77bcf86cd799439011",
  "title": "Test Post",
  "upvotes": 5,
  "downvotes": 2,
  "score": 3,
  "subredditIcon": "...",
  "authorIcon": "..."
}
```

**Comments transform:**
```javascript
// From API:
{
  "_id": "507f1f77bcf86cd799439012",
  "text": "Great post!",
  "upvotes": 2,
  "downvotes": 0
}

// Becomes:
{
  "commentId": "507f1f77bcf86cd799439012",
  "text": "Great post!",
  "upvotes": 2,
  "downvotes": 0,
  "score": 2,
  "authorIcon": "..."
}
```

---

## Best Practices

1. **Always handle loading & error states:**
   ```javascript
   if (loading) return <Skeleton />;
   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
   ```

2. **Refresh after mutations:**
   ```javascript
   const newPost = await createPost(data);
   refetch(); // Refresh the list
   ```

3. **Use try-catch in event handlers:**
   ```javascript
   try {
     await upvotePost(id);
   } catch (err) {
     setError(err.message);
   }
   ```

4. **Combine hooks in components:**
   ```javascript
   const { posts, refetch: refreshPosts } = usePosts();
   const { createPost } = useCreatePost();
   const { upvotePost } = usePostVote();
   ```
