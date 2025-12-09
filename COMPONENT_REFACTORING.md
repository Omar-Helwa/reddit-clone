# Reddit Clone - Component Refactoring Summary

## Overview
Successfully extracted and adapted components from the Reddit homepage HTML (sample.html) into a React-based structure for the ASU-Reddit-Clone project.

## Components Created

### 1. **Post Component** (`src/features/posts/Post.js`)
- **Purpose**: Displays individual post cards with metadata and actions
- **Props**:
  - `postId`: Unique post identifier
  - `title`: Post title
  - `author`: Post author username
  - `subreddit`: Community name (e.g., "r/hackthebox")
  - `timestamp`: When the post was created
  - `score`: Vote count
  - `commentCount`: Number of comments
  - `textBody`: Post content preview
  - `authorIcon`: Author's avatar URL
  - `subredditIcon`: Community icon URL
  - `onCommentClick`: Callback for comment button
  - `onUpvote`: Callback for upvote
  - `onDownvote`: Callback for downvote

- **Features**:
  - Credit bar with subreddit info and timestamp
  - Post title as clickable link
  - Text body with ellipsis truncation
  - Action buttons (upvote, downvote, comment, share, award)
  - Hover effects and responsive design

---

### 2. **PostList Component** (`src/features/posts/PostList.js`)
- **Purpose**: Manages and displays a list of posts with sorting
- **Features**:
  - Fetch posts from API (with mock data fallback)
  - Sort posts by: Best, Hot, New, Top, Rising
  - Handle upvote/downvote actions
  - Navigate to post details on comment click
  - Loading state handling
  - Mock data for development

- **Usage**:
```jsx
<PostList />
```

---

### 3. **SortDropdown Component** (`src/components/SortDropdown.js`)
- **Purpose**: Dropdown menu for sorting posts
- **Props**:
  - `onSortChange`: Callback when sort option is selected
  - `currentSort`: Current selected sort option
  
- **Options**: Best, Hot, New, Top, Rising
- **Features**:
  - Accessible dropdown menu
  - Visual feedback for active option
  - Smooth animations

---

### 4. **CommentList Component** (`src/features/comments/CommentList.js`)
- **Purpose**: Display and manage comments on a post
- **Props**:
  - `postId`: Post ID to fetch comments for
  - `comments`: Array of comment objects

- **Features**:
  - Nested comment threads with reply-to functionality
  - Comment submission form
  - Upvote/downvote for comments
  - Reply form with toggle
  - Threaded comments with indentation
  - Comment author links

- **Comment Structure**:
```javascript
{
  id: 'comment_id',
  author: 'username',
  text: 'Comment content',
  score: 42,
  timestamp: '2 hours ago',
  replies: [] // nested comments
}
```

---

### 5. **CommunityList Component** (`src/features/communities/CommunityList.js`)
- **Purpose**: Display list of communities in sidebar
- **Features**:
  - Fetch communities from API
  - Join/Subscribe to communities
  - Community icon, name, and member count
  - Mock data for development
  - Scrollable list with max-height
  - Link to discover communities

- **Community Structure**:
```javascript
{
  id: 'r_hackthebox',
  name: 'r/hackthebox',
  icon: 'icon_url',
  members: '101K',
  description: 'Description text'
}
```

---

### 6. **HomePage Component** (`src/pages/HomePage.js`)
- **Purpose**: Main home feed page layout
- **Layout**:
  - Left sidebar: Communities list
  - Center: Post feed
  - Right sidebar: Popular communities/widgets

- **Structure**:
```jsx
<HomePage>
  <LeftSidebar>
    <CommunityList />
  </LeftSidebar>
  <MainContent>
    <PostList />
  </MainContent>
  <RightSidebar>
    <PopularCommunities />
  </RightSidebar>
</HomePage>
```

---

## CSS Files Created

### 1. **Post.css** - Individual post card styling
- Card layout with hover effects
- Credit bar styling
- Title and text body styles
- Action button styling with hover states
- Responsive design for mobile

### 2. **PostList.css** - Post list container styling
- Sort controls styling
- Post list grid layout
- Loading and empty states
- Mobile responsive grid

### 3. **SortDropdown.css** - Dropdown menu styling
- Dropdown trigger button
- Menu positioning and animations
- Option styling with active state
- Focus/keyboard navigation styles

### 4. **CommentList.css** - Comment section styling
- Comment form styling
- Threaded comment indentation
- Comment actions (upvote, reply)
- Reply form styling
- Nested comment borders

### 5. **CommunityList.css** - Community sidebar styling
- Community item layout
- Icon and info styling
- Join button styling
- Scrollbar customization
- Mobile responsive design

### 6. **HomePage.css** - Home page layout
- Three-column grid layout
- Sticky sidebars
- Responsive breakpoints for tablet and mobile
- Sidebar widget styling

---

## Data Flow

### Post Fetching
```
PostList Component
  ↓
fetchPosts() - API call to /api/posts?sort={sortBy}
  ↓
setPosts() - Update state
  ↓
Render Post components with data
```

### User Actions
```
Post Component Actions
  ↓
onUpvote/onDownvote → Update post score
onCommentClick → Navigate to post detail
  ↓
CommentList loads comments
  ↓
User submits comment → API call → Update comment count
```

---

## Styling System

### Color Variables
- `--primary-color`: #0079d3 (Blue)
- `--neutral-background`: #ffffff
- `--neutral-background-hover`: #f6f6f6
- `--neutral-border`: #ccc
- `--text-primary`: #1a1a1b (Dark)
- `--text-secondary`: #818384 (Gray)

### Responsive Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

---

## API Endpoints Expected

1. `GET /api/posts?sort={BEST|HOT|NEW|TOP|RISING}` - Fetch posts
2. `POST /api/posts/{postId}/upvote` - Upvote post
3. `POST /api/posts/{postId}/downvote` - Downvote post
4. `GET /api/communities` - Fetch communities
5. `POST /api/communities/{communityId}/join` - Join community
6. `GET /api/posts/{postId}/comments` - Fetch comments
7. `POST /api/posts/{postId}/comments` - Create comment

---

## Next Steps

1. **Connect to Backend API**:
   - Replace mock data fetch calls with real API endpoints
   - Implement error handling and loading states

2. **User Authentication**:
   - Integrate with auth system for user-specific data
   - Handle user votes and preferences

3. **Enhanced Features**:
   - Image/media support in posts
   - Post filters and search
   - User profiles and saved posts
   - Notifications

4. **Performance Optimization**:
   - Implement lazy loading for posts
   - Add pagination for comments
   - Optimize re-renders with React.memo

5. **Accessibility**:
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support

---

## File Structure

```
src/
├── components/
│   └── SortDropdown.js
│   └── SortDropdown.css
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
├── pages/
│   ├── HomePage.js
│   └── HomePage.css
└── ...
```

---

## Testing Recommendations

1. **Unit Tests**:
   - Component rendering with various props
   - State management and callbacks
   - Mock data handling

2. **Integration Tests**:
   - Multiple components working together
   - API integration
   - User interaction flows

3. **E2E Tests**:
   - Complete user journeys
   - Navigation between pages
   - Real API integration

---

## Notes

- All components use mock data by default for development
- Styled to match Reddit's design language
- Fully responsive for mobile, tablet, and desktop
- Uses CSS custom properties for theming
- Accessibility features included (ARIA labels, semantic HTML)
- Ready for API integration when backend is available
