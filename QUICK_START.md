# Reddit Clone - Quick Start Guide

## ✅ Completed Work

I've successfully extracted and adapted all major components from the Reddit homepage HTML file (`sample.html`) into reusable React components for your project.

### Components Created:

#### 📱 Post System
- **Post.js** - Individual post card component
- **PostList.js** - Feed with sorting and state management
- Both include full styling with animations and responsive design

#### 💬 Comments System
- **CommentList.js** - Threaded comments with reply functionality
- Supports nested replies and comment actions

#### 👥 Communities System
- **CommunityList.js** - Community sidebar with join buttons
- Shows member counts and icons

#### 🎨 UI Components
- **SortDropdown.js** - Dropdown menu for feed sorting
- Accessible dropdown with keyboard navigation

#### 📄 Pages
- **HomePage.js** - Main feed layout with three-column design
- Integrates all components together

## 🚀 How to Use

### 1. Import Components

```jsx
// In HomePage.js or any page
import PostList from '../features/posts/PostList';
import CommunityList from '../features/communities/CommunityList';
import CommentList from '../features/comments/CommentList';

// In your component
<HomePage>
  <PostList />
  <CommunityList />
</HomePage>
```

### 2. Use Individual Post Component

```jsx
import Post from '../features/posts/Post';

<Post
  postId="t3_example"
  title="Example Post"
  author="username"
  subreddit="r/example"
  timestamp="2 hours ago"
  score={42}
  commentCount={5}
  textBody="Post content..."
  subredditIcon={iconUrl}
  authorIcon={authorUrl}
  onUpvote={handleUpvote}
  onDownvote={handleDownvote}
  onCommentClick={handleComment}
/>
```

### 3. Use Comments Component

```jsx
import CommentList from '../features/comments/CommentList';

<CommentList 
  postId="t3_example"
  comments={commentsArray}
/>
```

## 📊 Component Structure

```
Post → PostList → HomePage
            ↓
        CommunityList
        CommentList
        SortDropdown
```

## 🎨 Styling

All components use **CSS custom properties** for easy theming:

```css
--primary-color: #0079d3
--neutral-background: #ffffff
--text-primary: #1a1a1b
--text-secondary: #818384
```

Change these variables in your global CSS to theme the entire app!

## 📡 API Integration

Each component has a `fetchData()` function. Replace the endpoint:

```javascript
// In PostList.js
const response = await fetch(`/api/posts?sort=${sortBy}`);

// Change to your backend URL
const response = await fetch(`${API_URL}/posts?sort=${sortBy}`);
```

### Expected API Responses

**Posts:**
```javascript
[
  {
    postId: 'id',
    title: 'Title',
    author: 'username',
    subreddit: 'r/name',
    timestamp: '2 hours ago',
    score: 42,
    commentCount: 5,
    textBody: 'Content...',
    subredditIcon: 'url',
    authorIcon: 'url'
  }
]
```

**Communities:**
```javascript
[
  {
    id: 'r_name',
    name: 'r/name',
    icon: 'url',
    members: '100K',
    description: 'Description'
  }
]
```

**Comments:**
```javascript
[
  {
    id: 'comment_id',
    author: 'username',
    text: 'Comment text',
    score: 10,
    timestamp: '1 hour ago',
    replies: [] // nested comments
  }
]
```

## 🔧 Customization

### Change Colors
Edit `HomePage.css` or your global theme:

```css
:root {
  --primary-color: #your-color;
  --neutral-background: #your-bg;
  /* etc */
}
```

### Adjust Layout
Modify grid columns in `HomePage.css`:

```css
.home-page {
  grid-template-columns: 300px 1fr 312px; /* Left | Center | Right */
}
```

### Add More Actions
In `Post.js`, add buttons to the action bar:

```jsx
<button className="action-button">Your Action</button>
```

## 📱 Responsive Design

Components automatically adapt to:
- **Desktop** (1024px+): Full 3-column layout
- **Tablet** (768-1023px): 2-column layout
- **Mobile** (<768px): Single column layout

## ✨ Features Included

✅ Post cards with voting  
✅ Threaded comments  
✅ Community list with join  
✅ Sort dropdown  
✅ Responsive design  
✅ Mock data for development  
✅ Loading states  
✅ Hover animations  
✅ Keyboard accessible  
✅ ARIA labels  

## 📚 File Locations

```
src/
├── features/
│   ├── posts/
│   │   ├── Post.js
│   │   ├── Post.css
│   │   ├── PostList.js
│   │   └── PostList.css
│   ├── comments/
│   │   ├── CommentList.js
│   │   └── CommentList.css
│   └── communities/
│       ├── CommunityList.js
│       └── CommunityList.css
├── components/
│   ├── SortDropdown.js
│   └── SortDropdown.css
└── pages/
    ├── HomePage.js
    └── HomePage.css
```

## 🐛 Troubleshooting

**Posts not showing?**
- Check that PostList is imported correctly
- Verify API endpoint in PostList.js
- Mock data will show if API fails

**Styling not applied?**
- Make sure CSS files are imported with components
- Check for CSS custom property definitions
- Verify no CSS conflicts with existing styles

**Comments section empty?**
- Mock data loads automatically
- Check CommentList props are passed correctly

## 🎯 Next Steps

1. **Connect to Backend**: Update API endpoints
2. **Add User Auth**: Integrate login system
3. **Handle Images**: Add media support to posts
4. **Add Search**: Implement post/community search
5. **User Profiles**: Create profile pages
6. **Notifications**: Add real-time updates

## 💡 Tips

- Use React DevTools to inspect component props
- Check browser console for API errors
- Test on mobile to verify responsive design
- Use the mock data first before API integration
- Add loading skeletons for better UX

## 📖 Documentation

See `COMPONENT_REFACTORING.md` for detailed component documentation and data structures.

---

**Happy Coding! 🚀**

The app is now ready to use. Start the dev server and you should see the homepage with posts, communities, and a working comment system!
