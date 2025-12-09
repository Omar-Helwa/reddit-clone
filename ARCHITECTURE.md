# React Component Architecture

## Component Hierarchy

```
App
└── HomePage
    ├── Left Sidebar
    │   └── CommunityList
    │       ├── Community Item 1
    │       ├── Community Item 2
    │       ├── Community Item 3
    │       ├── Community Item 4
    │       └── Community Item 5
    │
    ├── Main Content
    │   ├── Sort Controls
    │   │   └── SortDropdown
    │   │       ├── "Best"
    │   │       ├── "Hot"
    │   │       ├── "New"
    │   │       ├── "Top"
    │       └── "Rising"
    │   │
    │   └── PostList
    │       ├── Post Card 1
    │       │   ├── Post Header
    │       │   ├── Post Title
    │       │   ├── Post Body
    │       │   └── Post Actions
    │       ├── Post Card 2
    │       ├── Post Card 3
    │       └── ...
    │
    └── Right Sidebar
        └── Popular Communities Widget
```

## Component Communication Flow

```
HomePage (Parent State)
    ↓
PostList (Fetch & Sort)
    ├── setLoading()
    ├── setPosts()
    ├── setSortBy()
    └──→ Post Component (Multiple)
         ├── onUpvote()
         ├── onDownvote()
         └── onCommentClick()
              ↓
         CommentList
         ├── submitComment()
         ├── toggleReply()
         └── handleCommentAction()
    
CommunityList
├── setLoading()
├── setCommunities()
└── handleJoinCommunity()

SortDropdown
├── onSortChange()
└── setState (isOpen)
```

## State Management

### PostList Component State
```javascript
const [posts, setPosts] = useState([])
const [loading, setLoading] = useState(true)
const [sortBy, setSortBy] = useState('BEST')
```

### CommentList Component State
```javascript
const [expandedComments, setExpandedComments] = useState({})
const [newComment, setNewComment] = useState('')
```

### CommunityList Component State
```javascript
const [communities, setCommunities] = useState([])
const [loading, setLoading] = useState(true)
```

### SortDropdown Component State
```javascript
const [isOpen, setIsOpen] = useState(false)
```

## Data Flow Diagram

### Upvoting a Post
```
User clicks upvote button on Post
         ↓
Post's onUpvote() callback fires
         ↓
PostList.handleUpvote(postId) executes
         ↓
setPosts() with updated score
         ↓
Post component re-renders with new score
```

### Fetching Posts
```
PostList component mounts
         ↓
useEffect(() => fetchPosts())
         ↓
setLoading(true)
         ↓
fetch('/api/posts?sort=BEST')
         ↓
Response received → setPosts(data)
         ↓
setLoading(false)
         ↓
Render posts with Post components
```

### Joining Community
```
User clicks "Join" on CommunityList item
         ↓
handleJoinCommunity(communityId) fires
         ↓
API call to POST /api/communities/{id}/join
         ↓
Update UI or refresh community list
```

## Props Flow

### Post Component Props
```
Post
├── postId: string
├── title: string
├── author: string
├── subreddit: string
├── timestamp: string
├── score: number
├── commentCount: number
├── textBody: string
├── subredditIcon: string (URL)
├── authorIcon: string (URL)
├── onUpvote: function
├── onDownvote: function
└── onCommentClick: function
```

### PostList Props
```
PostList
└── (No props - manages own state)
```

### CommentList Props
```
CommentList
├── postId: string
└── comments: array
```

### CommunityList Props
```
CommunityList
└── (No props - manages own state)
```

### SortDropdown Props
```
SortDropdown
├── onSortChange: function
└── currentSort: string
```

## Component Dependencies

```
Post
├── No external dependencies
└── Uses CSS: Post.css

PostList
├── Imports: Post, SortDropdown
├── Uses: fetch API, useState, useEffect
└── Uses CSS: PostList.css

CommentList
├── Uses: useState
└── Uses CSS: CommentList.css

CommunityList
├── Uses: fetch API, useState, useEffect
└── Uses CSS: CommunityList.css

SortDropdown
├── Uses: useState
└── Uses CSS: SortDropdown.css

HomePage
├── Imports: PostList, CommunityList, SortDropdown, CommentList
├── Uses CSS: HomePage.css
└── Contains grid layout logic
```

## Lifecycle

### Component Mount
```
HomePage mounts
    ↓
CommunityList mounts → fetch communities
PostList mounts → fetch posts
    ↓
[Loading states show]
    ↓
Data arrives → setState
    ↓
All components render with data
```

### User Interaction
```
User clicks upvote
    ↓
Post.onUpvote() → handleUpvote()
    ↓
PostList state updates
    ↓
Post component re-renders
```

### Sort Change
```
User selects "Hot" from dropdown
    ↓
SortDropdown.onSortChange('HOT')
    ↓
PostList.setSortBy('HOT')
    ↓
useEffect triggers fetchPosts()
    ↓
Loading state → new posts → render
```

## Performance Considerations

### Optimization Opportunities
```
Post (child)
└── Can be wrapped with React.memo()
    to prevent re-renders when props don't change

PostList (parent)
└── Consider pagination to load posts incrementally
    instead of all at once

CommentList (sibling to PostList)
└── Load comments on-demand
    not all at page load
```

## Routing Integration

### Suggested Routes
```
/
    └── HomePage
        └── Contains PostList, CommunityList

/r/:communityName
    └── CommunityPage
        └── Shows posts from specific community

/r/:communityName/comments/:postId
    └── PostPage
        └── Full post + comments

/u/:username
    └── ProfilePage
        └── User's posts and info
```

## Mobile Responsive Behavior

```
Desktop (1024px+)
├── Left: Communities (300px)
├── Center: Posts (1fr)
└── Right: Popular (312px)

Tablet (768px - 1023px)
├── Left: Hidden
├── Center: Posts (1fr)
└── Right: Popular (312px)

Mobile (<768px)
└── Center: Posts (full width)
    - Communities: Hidden
    - Right sidebar: Hidden
    - All components stack vertically
```

## Error Handling

```
fetch('/api/posts')
├── Success → setPosts(data)
├── Network Error → setMockPosts()
├── API Error → Show error message
└── Loading → Show loading skeleton
```

## Testing Structure

```
Post.test.js
├── Test props rendering
├── Test click handlers
└── Test styling

PostList.test.js
├── Test fetch behavior
├── Test sorting
├── Test state updates
└── Test Post child rendering

CommentList.test.js
├── Test comment display
├── Test reply functionality
└── Test form submission

CommunityList.test.js
├── Test fetch behavior
├── Test join button
└── Test community display

SortDropdown.test.js
├── Test dropdown open/close
├── Test option selection
└── Test callback firing

Integration tests
├── HomePage + all children
├── PostList + comments flow
└── Full user interactions
```

## Data Models

### Post Model
```javascript
{
  postId: string,
  title: string,
  author: string,
  subreddit: string,
  timestamp: string,
  score: number,
  commentCount: number,
  textBody: string,
  authorIcon: string,
  subredditIcon: string,
  awardCount: number,
  shareCount: number
}
```

### Comment Model
```javascript
{
  id: string,
  author: string,
  text: string,
  score: number,
  timestamp: string,
  replies: Comment[],
  authorIcon: string
}
```

### Community Model
```javascript
{
  id: string,
  name: string,
  icon: string,
  members: string,
  description: string,
  isSubscribed: boolean
}
```

---

This architecture provides:
- ✅ Clear component separation of concerns
- ✅ Unidirectional data flow
- ✅ Reusable components
- ✅ Easy testing
- ✅ Scalable structure
- ✅ Responsive design
