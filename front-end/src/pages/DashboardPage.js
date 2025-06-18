// src/pages/DashboardPage.js
import '../dashboardStyles.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from './NotificationContext';
import { useLocation as useAppLocation } from './LocationContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';




const ItemDisplayCard = ({ item, type }) => {
  return (
    <div className="item-card-wrapper">
      {/* Left: Image Section */}
      <div className="item-image-section">
        {item.image ? (
          <img
            src={`${API_BASE_URL}/uploads/${item.image}`}
            alt={item.item_type || 'Item'}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <p style={{ color: '#777' }}>No Image</p>
        )}
      </div>

      {/* Right: Content Section */}
      <div className="item-content-section">
        <div>
          <h4>{item.item_type}</h4>

          {/* Status badge */}
          {item.status && (
            <p className={`item-status ${item.status.toLowerCase()}`}>
              {item.status}
            </p>
          )}

          {/* City */}
          {item.city && (
            <p>
              <strong>City:</strong> {item.city}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p>
              <strong>Description:</strong> {item.description}
            </p>
          )}
        </div>

        {/* Contact Info – shown only when type === 'lost' */}
        {type === 'lost' && (item.user_name || item.email || item.phone) && (
          <div className="contact-info">
            {item.user_name && (
              <p>
                <strong>Reported by:</strong> {item.user_name}
              </p>
            )}
            {item.email && (
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${item.email}`}>{item.email}</a>
              </p>
            )}
            {item.phone && (
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${item.phone}`}>{item.phone}</a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


function DashboardPage() {
  const [user, setUser] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingLost, setIsLoadingLost] = useState(false);

  const navigate = useNavigate();
  const { location: appLocation, showLocationModal, handleAllowLocation, handleDenyLocation } = useAppLocation();

  const {
    newClaimCount,
    setNewClaimCount,
    updatedClaimCount,
    setUpdatedClaimCount
  } = useNotification();

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
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!appLocation?.latitude || !appLocation?.longitude) return;
    setIsLoadingNearby(true);
    const fetchNearby = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/items/nearby?latitude=${appLocation.latitude}&longitude=${appLocation.longitude}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setNearbyItems(res.data.nearby || []);
      } catch (error) {
        setNearbyItems([]);
      } finally {
        setIsLoadingNearby(false);
      }
    };
    fetchNearby();
  }, [appLocation]);

  useEffect(() => {
    if (!appLocation?.latitude || !appLocation?.longitude) return;
    setIsLoadingLost(true);
    const fetchNearbyLost = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/items/nearby-lost?latitude=${appLocation.latitude}&longitude=${appLocation.longitude}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setLostItems(res.data.nearbyLost || []);
      } catch (error) {
        setLostItems([]);
      } finally {
        setIsLoadingLost(false);
      }
    };
    fetchNearbyLost();
  }, [appLocation]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const ownerRes = await axios.get(`${API_BASE_URL}/api/notifications/owner/new-claims`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const claimantRes = await axios.get(`${API_BASE_URL}/api/notifications/claimant/status-updates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewClaimCount(ownerRes.data.newClaimCount || 0);
        setUpdatedClaimCount(claimantRes.data.updatedClaimCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications');
      }
    };
    fetchNotifications();
  }, [setNewClaimCount, setUpdatedClaimCount]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>📍 Show Nearby Items?</h3>
            <p>Allow access to your location to display items near you.</p>
            <div className="modal-actions">
              <button onClick={handleAllowLocation}>Yes, allow</button>
              <button onClick={handleDenyLocation}>No thanks</button>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <h2>Welcome, {user?.user_name || 'User'}!</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <nav className="dashboard-nav">
        <NavLink to="/dashboard" end>🏠 Home</NavLink>
        <NavLink to="/add-item">➕ Add Item</NavLink>
        <NavLink to="/search-item">🔍 Search</NavLink>
        <NavLink to="/my-items">📦 My Items</NavLink>
        <NavLink to="/my-claims">
          📄 My Claims
          {updatedClaimCount > 0 && <span className="badge">{updatedClaimCount}</span>}
        </NavLink>
        <NavLink to="/view-claims">
          📥 Claims on My Items
          {newClaimCount > 0 && <span className="badge">{newClaimCount}</span>}
        </NavLink>
      </nav>

      <section className="dashboard-content">
        {appLocation && (
          <>
            <h3>📍 Found Items Near You</h3>
            {isLoadingNearby ? <p className="no-items">Loading nearby found items...</p> :
              nearbyItems.length === 0 ? (
                <p className="no-items">No nearby found items reported at the moment.</p>
              ) : (
                <div className="items-grid">
                  {nearbyItems.map(item => (
                    <ItemDisplayCard key={item.id || item.item_id} item={item} type="found" />
                  ))}
                </div>
              )}
          </>
        )}

        <h3>🧭 Lost Items {appLocation ? "Near You" : "Reported"}</h3>
        {isLoadingLost ? <p className="no-items">Loading lost items...</p> :
          lostItems.length === 0 ? (
            <p className="no-items">No lost items {appLocation ? "nearby" : ""} reported at the moment.</p>
          ) : (
            <div className="items-grid">
              {lostItems.map(item => (
                <ItemDisplayCard key={item.id || item.item_id} item={item} type="lost" />
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

export default DashboardPage;
