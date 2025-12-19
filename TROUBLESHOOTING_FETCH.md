# Troubleshooting: Failed to Fetch When Creating Posts

## ✅ What I Fixed

1. **Added port number** to API URL:
   - Before: `http://98.66.152.246` ❌
   - After: `http://98.66.152.246:3000` ✅
   - Applied to: `postsAPI.js` and `commentsAPI.js`

2. **Enabled CORS** on backend:
   - Added `cors` middleware to RestApiServer
   - Allows React frontend to communicate with backend
   - Installed `cors` npm package

## 🚀 Next Steps

### 1. Restart Backend Server
```bash
cd server
npm start
```
You should see: `REST API listening on port 3000`

### 2. Make sure MongoDB is accessible
- MongoDB running at: `mongodb://98.66.152.246:27017`
- Check with MongoDB Compass

### 3. Test Creating a Post
1. Go to your React app (localhost:3000)
2. Create a new post
3. Check browser console (F12) for errors
4. Check MongoDB Compass for the post in `reddit-clone.posts` collection

## 🔍 Common Issues

### Issue: "Failed to fetch" still appears
**Possible causes:**
- Backend server not running → Run `npm start` in server folder
- MongoDB not accessible → Check MongoDB connection in MongoDB Compass
- Wrong IP address → If running locally, use `http://localhost:3000` instead

### Issue: CORS error in console
**Solution:**
- You just installed cors, so restart your backend server
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Post appears on website but not in MongoDB
**This is normal:**
- Post saved to localStorage (displays instantly)
- Also sent to API (saved to database)
- Check MongoDB after a few seconds

## 📝 API Endpoints

Your backend now supports:

```
POST   http://98.66.152.246:3000/posts          (Create post)
GET    http://98.66.152.246:3000/posts          (Get all posts)
GET    http://98.66.152.246:3000/posts/:id      (Get single post)
PUT    http://98.66.152.246:3000/posts/:id      (Update post)
DELETE http://98.66.152.246:3000/posts/:id      (Delete post)

POST   http://98.66.152.246:3000/comments       (Create comment)
GET    http://98.66.152.246:3000/comments       (Get all comments)
```

## 🆘 If it still doesn't work

Check:
1. Open F12 → Network tab
2. Try creating a post again
3. Look for a failed request to `/posts`
4. Click on it and check the response/error message
5. Share that error message for more specific help
