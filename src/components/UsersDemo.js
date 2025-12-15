// Example Component: Display Users from MongoDB
// This demonstrates how to fetch and display users in your React app

import React, { useState, useEffect } from 'react';
import { listUsers } from '../api/usersApi';
import './UsersDemo.css';

function UsersDemo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await listUsers({
        limit: pageSize,
        skip: page * pageSize
      });
      
      setUsers(response.items || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="users-demo">
        <h2>Users from MongoDB</h2>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-demo">
        <h2>Users from MongoDB</h2>
        <div className="error">Error: {error}</div>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="users-demo">
      <h2>Users from MongoDB</h2>
      
      <div className="users-list">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-avatar">
                {user.image ? (
                  <img src={user.image} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="user-info">
                <h3>{user.username}</h3>
                <p className="user-email">{user.email}</p>
                <p className="user-date">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={users.length < pageSize}
        >
          Next
        </button>
      </div>

      <button onClick={fetchUsers} className="refresh-btn">
        Refresh
      </button>
    </div>
  );
}

export default UsersDemo;
