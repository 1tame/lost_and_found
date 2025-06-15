import React, { useEffect, useState } from 'react';
import '../ClaimsOnMyItems.css';
import { showSuccess, showError } from '../ToastService';
import '../dashboardStyles.css';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';


const ClaimsOnMyItems = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
   // newClaimCount,
    //setNewClaimCount,
    updatedClaimCount,
    //setUpdatedClaimCount
  } = useNotification();

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

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/claims/view', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setClaims(data.claims);
      else showError(data.message || 'Failed to fetch claims');
    } catch (err) {
      console.error('Error fetching claims:', err);
      showError('Server error while fetching claims');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (claimId, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3001/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message || 'Status updated');
        fetchClaims();
      } else {
        showError(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update error:', err);
      showError('Server error during update');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Claims on Your Items</h2>
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
              <Link to="/view-claims">📥 Claims on My Items</Link>
              
            </nav>

      <section className="dashboard-content">
        {loading ? (
          <p>Loading...</p>
        ) : claims.length === 0 ? (
          <p>No claims found.</p>
        ) : (
          claims.map((claim) => (
            <div className="claim-card" key={claim.claim_id}>
              <h3>Claim for: {claim.item_type}</h3>

              <div className="claim-details">
                <p><strong>Item Name:</strong> {claim.item_name}</p>
                <p><strong>Color:</strong> {claim.item_color}</p>
                {claim.model && <p><strong>Model:</strong> {claim.model}</p>}
                {claim.special_tag_or_symbol && (
                  <p><strong>Special Tag/Symbol:</strong> {claim.special_tag_or_symbol}</p>
                )}
                {claim.specific_location && (
                  <p><strong>Specific Location:</strong> {claim.specific_location}</p>
                )}
                {claim.image && (
                  <div>
                    <strong>Claim Image:</strong><br />
                    <img
                      src={`http://localhost:3001/uploads/${claim.image}`}
                      alt="Claim"
                      className="claim-image"
                    />
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div className="claim-contact">
                <p><strong>Claimant:</strong> {claim.claimant_name}</p>
                <p><strong>Email:</strong> {claim.claimant_email}</p>
                <p><strong>Phone:</strong> {claim.claimant_phone}</p>
                <p><strong>Status:</strong> {claim.status}</p>
              </div>

              <p className="timestamp">
                <strong>Submitted:</strong> {new Date(claim.created_at).toLocaleString()}
              </p>

              <div className="button-group">
                <button
                  className="action-button"
                  onClick={() => updateStatus(claim.claim_id, 'Approved')}
                >
                  ✅ Approve
                </button>
                <button
                  className="action-button"
                  onClick={() => updateStatus(claim.claim_id, 'Rejected')}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default ClaimsOnMyItems;
