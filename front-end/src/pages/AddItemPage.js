// src/pages/AddItemPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../dashboardStyles.css';
import '../AddItemPage.css';
import axios from 'axios';
import { showSuccess, showError } from '../ToastService';
import { useNotification } from './NotificationContext';
import { useLocation } from './LocationContext';

const AddItemPage = () => {
  const [item_type, setItemType] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { location } = useLocation();
  const {
    newClaimCount,
    setNewClaimCount,
    updatedClaimCount,
    setUpdatedClaimCount
  } = useNotification();
  const navigate = useNavigate();

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
    localStorage.clear();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item_type || !city || !status) {
      showError('Item type, city, and status are required');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      let response;
      const latitude = location?.latitude;
      const longitude = location?.longitude;

      if (status === 'Lost') {
        const formData = new FormData();
        formData.append('item_type', item_type);
        formData.append('city', city);
        formData.append('status', status);
        formData.append('description', description);
        if (image) formData.append('image', image);
        if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());
}

        response = await fetch('http://localhost:3001/api/items/add', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        const body = { item_type, city, status };
        if (latitude && longitude) {
          body.latitude = latitude;
          body.longitude = longitude;
        }

        response = await fetch('http://localhost:3001/api/items/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();

      if (response.ok) {
        showSuccess('Item added successfully!');
        setItemType('');
        setCity('');
        setStatus('');
        setDescription('');
        setImage(null);
      } else {
        showError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error:', err);
      showError('Server error');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Add New Item</h2>
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

      <section className="dashboard-content">
        <div className="form-wrapper">
          <h3 className="add-item-title">Lost or Found Item Form</h3>
          <form onSubmit={handleSubmit} className="add-item-form">
            <div>
              <label>Item Type:</label>
              <input
                type="text"
                value={item_type}
                onChange={(e) => setItemType(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label>City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label>Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
                required
              >
                <option value="">--Select--</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            {status === 'Lost' && (
              <>
                <div>
                  <label>Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="form-input"
                    required
                  ></textarea>
                </div>

                <div>
                  <label>Upload Image (optional):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="file-input"
                  />
                </div>
              </>
            )}

            <button type="submit" className="submit-button">Submit Item</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AddItemPage;
