import '../dashboardStyles.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from './NotificationContext';
import axios from 'axios';

function DashboardPage() {
 const [user, setUser] = useState(null);
const [lostItems, setLostItems] = useState([]);
const navigate = useNavigate();
const {
  newClaimCount,
  setNewClaimCount,
  updatedClaimCount,
  setUpdatedClaimCount
} = useNotification();

  // Check login and decode token
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
    }
  }, [navigate]);

  // Fetch lost items
  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/items/view');
        setLostItems(res.data.items);
      } catch (error) {
        console.error('Failed to fetch lost items:', error);
      }
    };

    fetchLostItems();
  }, []);

  // Fetch claim notifications
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
  }, [setNewClaimCount, setUpdatedClaimCount]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome {user?.user_name}</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      
            <nav className="dashboard-nav">
              <Link to="/dashboard">🏠 Home</Link>
              <Link to="/add-item">➕ Add Item</Link>
              <Link to="/search-item">🔍 Search</Link>
              <Link to="/my-items">📦 My Items</Link>
              <Link to="/my-claims">
                📄 My Claims
                {updatedClaimCount > 0 && (
                  <span className="badge">{updatedClaimCount}</span>
                )}
              </Link>
              <Link to="/view-claims">
                📥 Claims on My Items
                {newClaimCount > 0 && (
                  <span className="badge">{newClaimCount}</span>
                )}
              </Link>
            </nav>

      <section className="dashboard-content">
        <h3>Recently Lost Items</h3>
        {lostItems.length === 0 ? (
          <p className="no-items">No lost items available.</p>
        ) : (
          <div className="items-grid">
            {lostItems.map(item => (
              <div key={item.item_id} className="item-card">
                <h4>{item.item_type}</h4>
                <p><strong>City:</strong> {item.city}</p>
                <p><strong>Description:</strong> {item.description}</p>
                <p><strong>Reported by:</strong> {item.user_name}</p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${item.email}`} className="contact-link">
                    {item.email}
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${item.phone}`} className="contact-link">
                    {item.phone}
                  </a>
                </p>
                {item.image && (
                  <img
                    src={`http://localhost:3001/uploads/${item.image}`}
                    alt="item"
                    className="item-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
