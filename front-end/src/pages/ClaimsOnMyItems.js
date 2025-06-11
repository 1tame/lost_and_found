import React, { useEffect, useState } from 'react';
import '../ClaimsOnMyItems.css';

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
    } catch (error) {
      console.error('Error fetching claims:', error);
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
        alert(data.message);
        fetchClaims();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="claims-container">
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
