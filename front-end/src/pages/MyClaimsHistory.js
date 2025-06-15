import React, { useEffect, useState } from 'react';
import '../MyClaimHistory.css';
import { showSuccess, showError } from '../ToastService';
import '../dashboardStyles.css';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const MyClaimHistory = () => {
  const [claims, setClaims] = useState([]);
   const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
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
  


  useEffect(() => {
  const markAsSeen = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:3001/api/notifications/claimant/mark-seen', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark as seen');
    }
  };

  markAsSeen();
}, []);

  const fetchMyHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/claims/my-claims', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setClaims(data.claims);
    } catch (err) {
      console.error('Error fetching claim history:', err);
      showError('Error fetching claim history');
    } finally {
      setLoading(false);
    }
  };


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
    localStorage.clear();
    navigate('/');
  };

  const confirmDelete = (claimId) => setConfirmDeleteId(claimId);

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/claims/delete/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setClaims(prev => prev.filter(claim => claim.claim_id !== confirmDeleteId));
        showSuccess('Claim deleted successfully.');
      } else {
        showError(data.message || 'Failed to delete claim.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showError('Server error while deleting claim.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>My Claim History</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <nav className="dashboard-nav">
                    <Link to="/dashboard">🏠 Home</Link>
                    <Link to="/add-item">➕ Add Item</Link>
                    <Link to="/search-item">🔍 Search</Link>
                    <Link to="/my-items">📦 My Items</Link>
                    <Link to="/my-claims">📄 My Claims</Link>
                    <Link to="/view-claims">
                      📥 Claims on My Items
                      {newClaimCount > 0 && (
                        <span className="badge">{newClaimCount}</span>
                      )}
                    </Link>
                  </nav>
      

      <section className="dashboard-content">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : claims.length === 0 ? (
          <p className="empty-message">You haven’t submitted any claims.</p>
        ) : (
          <div className="claims-grid">
            {claims.map(claim => (
              <div className="claim-history-card" key={claim.claim_id}>
                <p><strong>Item Type:</strong> {claim.item_type}</p>
                <p><strong>Item Name:</strong> {claim.item_name}</p>
                <p><strong>Status:</strong> {claim.status}</p>
                <p className="claim-date">
                  Submitted: {new Date(claim.created_at).toLocaleString()}
                </p>
                <button
                  className="delete-button"
                  onClick={() => confirmDelete(claim.claim_id)}
                >
                  Delete Claim
                </button>
              </div>
            ))}
          </div>
        )}

        {confirmDeleteId && (
          <div className="confirm-card-overlay">
            <div className="confirm-card">
              <p>Are you sure you want to delete this claim?</p>
              <div className="confirm-actions">
                <button className="confirm-delete" onClick={handleDeleteConfirmed}>Yes, Delete</button>
                <button className="cancel-delete" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyClaimHistory;
