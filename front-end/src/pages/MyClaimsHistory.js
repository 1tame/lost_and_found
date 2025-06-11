import React, { useEffect, useState } from 'react';
import '../MyClaimHistory.css'; // ← Add this line

const MyClaimHistory = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (claimId) => {
    const confirmed = window.confirm('Are you sure you want to delete this claim?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/claims/delete/${claimId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setClaims(prev => prev.filter(claim => claim.claim_id !== claimId));
        alert('Claim deleted successfully.');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete claim.');
      }
    } catch (err) {
      console.error('Error deleting claim:', err);
      alert('Server error while deleting claim.');
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, []);

  return (
    <div className="claim-history-container">
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
              onClick={() => handleDelete(claim.claim_id)}
            >
              Delete Claim
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyClaimHistory;
