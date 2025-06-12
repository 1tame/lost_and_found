import React, { useEffect, useState } from 'react';
import '../MyClaimHistory.css';
import { showSuccess, showError } from '../ToastService'; 
import '../dashboardStyles.css'; 
import { Link } from 'react-router-dom';


const MyClaimHistory = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const confirmDelete = (claimId) => {
    setConfirmDeleteId(claimId);
  };

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
      console.error('Error deleting claim:', err);
      showError('Server error while deleting claim.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, []);

  return (
    <div className="claim-history-container">

      <nav className="dashboard-nav">
              <Link to="/add-item">Add Item</Link>
              <Link to="/search-item">Search Items</Link>
              <Link to="/my-claims">My Claims</Link>
              <Link to="/view-claims">Claims on My Items</Link>
              <Link to="/dashboard">Home page</Link>
              
              
            </nav>


      <h2>My Claim History</h2>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : claims.length === 0 ? (
        <p className="empty-message">You haven’t submitted any claims.</p>
      ) : (
        claims.map(claim => (
          <div className="claim-card" key={claim.claim_id}>
            <p><strong>Item Type:</strong> {claim.item_type}</p>
            <p><strong>Item Name:</strong> {claim.item_name}</p>
            <p><strong>Status:</strong> {claim.status}</p>
            <p><strong>Submitted on:</strong> {new Date(claim.created_at).toLocaleString()}</p>
            <button
              className="delete-button"
              onClick={() => confirmDelete(claim.claim_id)}
            >
              Delete Claim
            </button>
          </div>
        ))
      )}

      {/* Custom Confirmation Card */}
      {confirmDeleteId && (
        <div className="confirm-card-overlay">
          <div className="confirm-card">
            <p>Are you sure you want to delete this claim?</p>
            <div className="confirm-actions">
              <button onClick={handleDeleteConfirmed}>Yes, Delete</button>
              <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClaimHistory;
