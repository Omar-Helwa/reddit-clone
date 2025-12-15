# Client-Side API Integration Guide

This guide explains how to use the MongoDB API in your React components.

## 📁 Files Created

- **`src/api/apiClient.js`** - Main API client with all CRUD operations
- **`src/utils/auth.js`** - User authentication helpers (localStorage management)
- **`src/components/UsersDemo.js`** - Example component showing how to fetch/display users
- **`src/hooks/useApiData.js`** - Reusable React hooks for data fetching

## 🔌 API Configuration

The API base URL is set in `src/api/apiClient.js`:

```javascript
const API_BASE_URL = 'http://98.66.152.246';
```

## 🎯 Features Implemented

### ✅ 1. User Signup (Create User)

**Location:** `src/pages/SignupPage.js`

When users fill out the signup form and click "Sign Up":
1. Form validates input (username, email, password)
2. Calls `createUser()` API to add user to MongoDB
3. Saves user info to localStorage automatically
4. Redirects to home page with user logged in

**How it works:**
```javascript
const { createUser } = await import('../api/apiClient');
const { setCurrentUser } = await import('../utils/auth');

const newUser = await createUser({
  username: formData.username,
  email: formData.email,
  password: formData.password,
  image: ''
});

setCurrentUser(newUser); // Saves to localStorage
window.location.href = '/'; // Redirect home
```

### ✅ 2. Account Deletion (Delete User)

**Location:** `src/pages/SettingsPage.js`

When users click "Delete Account" in Settings:
1. Shows confirmation prompt (must type "DELETE")
2. Calls `deleteUser()` API to remove user from MongoDB
3. Clears user data from localStorage
4. Redirects to home page

**How it works:**
```javascript
const { getCurrentUserId, clearCurrentUser } = await import('../utils/auth');
const { deleteUser } = await import('../api/apiClient');

const userId = getCurrentUserId();
await deleteUser(userId);
clearCurrentUser(); // Removes from localStorage
window.location.href = '/';
```

### ✅ 3. Fetch Users (List Users)

**Available Methods:**
```javascript
import { listUsers, getUser } from '../api/apiClient';

// Get all users with pagination
const response = await listUsers({ limit: 25, skip: 0 });
console.log(response.items); // Array of users

// Get single user by ID
const user = await getUser('67890abc123def456');
```

**Example Component:** `src/components/UsersDemo.js`
- Shows how to fetch and display users
- Includes pagination
- Error handling and loading states

## 📚 API Methods Available

### Users
```javascript
import { 
  listUsers,     // GET /users - List all users
  getUser,       // GET /users/:id - Get one user
  createUser,    // POST /users - Create new user (signup)
  updateUser,    // PATCH /users/:id - Update user
  deleteUser     // DELETE /users/:id - Delete user (delete account)
} from '../api/apiClient';
```

### Posts (placeholder - add schema first)
```javascript
import { 
  listPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost 
} from '../api/apiClient';
```

### Comments (placeholder - add schema first)
```javascript
import { 
  listComments, 
  getComment, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../api/apiClient';
```

## 🔐 Authentication Helpers

```javascript
import { 
  setCurrentUser,      // Save user after login/signup
  getCurrentUser,      // Get user object
  getCurrentUserId,    // Get user ID
  isLoggedIn,          // Check if logged in
  clearCurrentUser,    // Logout
  updateCurrentUser    // Update stored user info
} from '../utils/auth';

// Example usage
const user = getCurrentUser();
if (user) {
  console.log(`Welcome ${user.username}!`);
}
```

## 🎨 Using in Your Components

### Method 1: Direct API Call
```javascript
import { listUsers } from '../api/apiClient';

function MyComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await listUsers({ limit: 50 });
        setUsers(response.items);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    loadUsers();
  }, []);

  return <div>{users.map(u => <div key={u._id}>{u.username}</div>)}</div>;
}
```

### Method 2: Using Custom Hook
```javascript
import { useUsers } from '../hooks/useApiData';

function MyComponent() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{users.map(u => <div key={u._id}>{u.username}</div>)}</div>;
}
```

### Method 3: Example Demo Component
```javascript
import UsersDemo from '../components/UsersDemo';

function MyPage() {
  return <UsersDemo />;
}
```

## 🧪 Testing the API

1. **Check if backend is running:**
```bash
curl http://98.66.152.246/health
# Should return: {"status":"ok"}
```

2. **Test fetching users:**
```bash
curl http://98.66.152.246/users
```

3. **Test in browser console:**
```javascript
// Open browser console on your React app
import { listUsers } from './api/apiClient';
const users = await listUsers();
console.log(users);
```

## 🚀 Next Steps

### Add Posts Schema
Create `server/schemas/posts.schema.js`:
```javascript
import { Schemas } from '../src/schemas/Schemas.js';

export default class PostsSchema extends Schemas {
  constructor() {
    super({
      schemaName: 'posts',
      databaseName: 'reddit',
      collectionName: 'posts',
    });
  }

  getFieldDefinitions() {
    return {
      title: { type: 'string', required: true, minLength: 1 },
      body: { type: 'string', required: true },
      authorId: { type: 'string', required: true },
      communityId: { type: 'string' },
      score: { type: 'number', default: 0, integer: true },
      createdAt: { type: 'number', default: () => Date.now() },
    };
  }
}
```

Then restart backend and use:
```javascript
import { listPosts, createPost } from '../api/apiClient';
```

### Add Comments Schema
Similar pattern - then the API will auto-work!

## 📖 Reference

- Backend API runs at: `http://98.66.152.246`
- All endpoints return JSON
- Pagination: `?limit=25&skip=0`
- Error responses: `{ error: "message" }`
- Success responses: `{ items: [...], count: N }`

## 🔧 Troubleshooting

**CORS errors?**
- Make sure backend allows your frontend origin
- Or use CRA proxy during development

**Network errors?**
- Check backend is running: `curl http://98.66.152.246/health`
- Verify MongoDB connection in backend `.env`

**User not found?**
- Make sure user ID is stored after signup
- Check localStorage: `console.log(localStorage.getItem('userId'))`
