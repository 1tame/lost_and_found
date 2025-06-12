import React, { useEffect, useState } from 'react';
import '../ClaimsOnMyItems.css';
import { showSuccess, showError } from '../ToastService';
import '../dashboardStyles.css'; 
import { Link } from 'react-router-dom';

const ClaimsOnMyItems = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/claims/view', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setClaims(data.claims);
      else showError(data.message || 'Failed to fetch claims');
    } catch (error) {
      console.error('Error fetching claims:', error);
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

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="claims-container">

      <nav className="dashboard-nav">
              <Link to="/add-item">Add Item</Link>
              <Link to="/search-item">Search Items</Link>
              <Link to="/my-claims">My Claims</Link>
              <Link to="/view-claims">Claims on My Items</Link>
                            <Link to="/dashboard">Home page</Link>
              
              
            </nav>


      <h2>Claims on Your Items</h2>
      {loading ? (
        <p>Loading...</p>
      ) : claims.length === 0 ? (
        <p>No claims found.</p>
      ) : (
        claims.map((claim) => (
          <div className="claim-card" key={claim.claim_id}>
            <h3>Claim for: {claim.item_type}</h3>

            <div>
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

            <div>
              <p><strong>Claimant Name:</strong> {claim.claimant_name}</p>
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
                Approve
              </button>

              <button
                className="action-button"
                onClick={() => updateStatus(claim.claim_id, 'Rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ClaimsOnMyItems;
