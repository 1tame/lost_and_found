// src/pages/MyItemsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import '../myItems.css';
import '../dashboardStyles.css';
import '../MyClaimHistory.css';

function MyItemsPage() {
  const [myItems, setMyItems] = useState([]);
  const [user, setUser] = useState(null);
  const [newClaimCount, setNewClaimCount] = useState(0);
  const [updatedClaimCount, setUpdatedClaimCount] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error('Invalid token');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    const fetchMyItems = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/items/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyItems(res.data.items);
      } catch (err) {
        console.error('Failed to fetch your items:', err);
      }
    };

    fetchMyItems();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const ownerRes = await axios.get('http://localhost:3001/api/notifications/owner/new-claims', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const claimantRes = await axios.get('http://localhost:3001/api/notifications/claimant/status-updates', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNewClaimCount(ownerRes.data.newClaimCount || 0);
        setUpdatedClaimCount(claimantRes.data.updatedClaimCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Confirmed delete handler
  const handleDeleteConfirmed = async () => {
    const token = localStorage.getItem('token');
    if (!confirmDeleteId) return;

    try {
      await axios.delete(`http://localhost:3001/api/items/${confirmDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyItems(prev => prev.filter(item => item.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Manage Items</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <nav className="dashboard-nav">
        <Link to="/dashboard">🏠 Home</Link>
        <Link to="/add-item">➕ Add Item</Link>
        <Link to="/search-item">🔍 Search</Link>
        <Link to="/my-items">📦 My Items</Link>
        <Link to="/my-claims">
          📄 My Claims
          {updatedClaimCount > 0 && <span className="badge">{updatedClaimCount}</span>}
        </Link>
        <Link to="/view-claims">
          📥 Claims on My Items
          {newClaimCount > 0 && <span className="badge">{newClaimCount}</span>}
        </Link>
      </nav>

      <div className="my-items-page">
        <h2>📦 My Posted Items</h2>
        {myItems.length === 0 ? (
          <p>No items posted yet.</p>
        ) : (
          <div className="items-grid">
            {myItems.map(item => (
              <div key={item.id} className="item-card">
                <h4>{item.item_type}</h4>
                <p><strong>City:</strong> {item.city}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Description:</strong> {item.description}</p>
                {item.image && (
                  <img
                    src={`http://localhost:3001/uploads/${item.image}`}
                    alt="item"
                    className="item-image"
                  />
                )}
                <button
                  className="delete-button"
                  onClick={() => setConfirmDeleteId(item.id)}
                >
                  Delete Item
                </button>
              </div>
            ))}
          </div>
        )}

        {confirmDeleteId && (
          <div className="confirm-card-overlay">
            <div className="confirm-card">
              <p>Are you sure you want to delete this item?</p>
              <div className="confirm-actions">
                <button className="confirm-delete" onClick={handleDeleteConfirmed}>Yes, Delete</button>
                <button className="cancel-delete" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyItemsPage;
