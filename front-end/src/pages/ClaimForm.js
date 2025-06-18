import React from 'react';
import { showSuccess, showError } from '../ToastService';

const ClaimForm = ({ itemId, claimData, setClaimData, onClose }) => {
  const token = localStorage.getItem('token');

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(claimData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      const res = await fetch(`http://localhost:3001/api/claims/${itemId}/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess('Claim submitted!');
        onClose(); // close form
      } else {
        showError(data.message || 'Claim failed');
      }
    } catch (err) {
      console.error(err);
      showError('Server error');
    }
  };

  return (
    <div className="claim-form">
      <span onClick={onClose} className="close-icon">❌</span>
      <h4>Submit Claim</h4>
      <div className="claim-notice">
        ⚠️ <strong>Notice:</strong> Your contact info will be shared with the item reporter.
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
      <button onClick={handleSubmit}>Submit Claim</button>
    </div>
  );
};

export default ClaimForm;
