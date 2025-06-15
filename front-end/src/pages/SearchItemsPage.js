import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../dashboardStyles.css';
import '../SearchItemPage.css';
import { showSuccess, showError } from '../ToastService';
import { useNotification } from './NotificationContext';
import axios from 'axios';


const SearchItemsPage = () => {
  const [itemType, setItemType] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [claimData, setClaimData] = useState({
    item_name: '',
    item_color: '',
    model: '',
    special_tag_or_symbol: '',
    specific_location: '',
    image: null,
  });

  const {
    newClaimCount,
    setNewClaimCount,
    updatedClaimCount,
    setUpdatedClaimCount
  } = useNotification();
  

  const navigate = useNavigate();

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
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!itemType || !city) return showError('Both fields are required');

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/items/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_type: itemType, city }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data.results);
        if (data.results.length === 0) {
          showError('No items matched your search.');
        }
      } else {
        setError(data.message || 'No items found');
      }
    } catch (err) {
      console.error(err);
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (item_id) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.entries(claimData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      const res = await fetch(`http://localhost:3001/api/claims/${item_id}/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess('Claim submitted!');
        setActiveClaimId(null);
        setClaimData({
          item_name: '',
          item_color: '',
          model: '',
          special_tag_or_symbol: '',
          specific_location: '',
          image: null,
        });
      } else {
        showError(data.message || 'Claim failed');
      }
    } catch (err) {
      console.error(err);
      showError('Server error');
    }
  };

  const handleRemoveItem = (id) => {
    setResults(results.filter((item) => item.id !== id));
    if (activeClaimId === id) setActiveClaimId(null);
  };

  return (
    <div className="dashboard-page">
      {/* Reused header and nav */}
      <header className="dashboard-header">
        <h2>Search Found Items</h2>
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
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            placeholder="Item Type"
            required
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            required
          />
          <button type="submit">Search</button>
        </form>

        {loading && <p className="loading-message">Loading...</p>}
        {error && <p className="error-message">{error}</p>}

        {results.map((item) => (
          <div key={item.id} className="result-card">
            <span
              onClick={() => handleRemoveItem(item.id)}
              className="remove-icon"
              title="Remove this result"
            >
              ❌
            </span>

            <p><strong>Item Type:</strong> {item.item_type}</p>
            <p><strong>City:</strong> {item.city}</p>
            <p><strong>Status:</strong> {item.status}</p>

            <button onClick={() => setActiveClaimId(item.id)}>Claim</button>

            {activeClaimId === item.id && (
              <div className="claim-form">
                <span
                  onClick={() => setActiveClaimId(null)}
                  className="close-icon"
                  title="Close claim form"
                >
                  ❌
                </span>

                <h4>Submit Claim</h4>
                <div className="claim-notice">
                  ⚠️ <strong>Notice:</strong> Your contact details will be shared with the item reporter to verify your claim.
                </div>

                <input
                  type="text"
                  placeholder="Item Name *"
                  value={claimData.item_name}
                  onChange={(e) => setClaimData({ ...claimData, item_name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Item Color *"
                  value={claimData.item_color}
                  onChange={(e) => setClaimData({ ...claimData, item_color: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Model (optional)"
                  value={claimData.model}
                  onChange={(e) => setClaimData({ ...claimData, model: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Special Tag or Symbol"
                  value={claimData.special_tag_or_symbol}
                  onChange={(e) => setClaimData({ ...claimData, special_tag_or_symbol: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Specific Location"
                  value={claimData.specific_location}
                  onChange={(e) => setClaimData({ ...claimData, specific_location: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setClaimData({ ...claimData, image: e.target.files[0] })}
                />
                <button onClick={() => handleClaimSubmit(item.id)}>Submit Claim</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default SearchItemsPage;
