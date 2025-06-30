import React from 'react';

const LocationPermissionModal = ({ onAllow, onDeny }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>📍 Show Nearby Items?</h3>
      <p>Allow access to your location to display items near you.</p>
      <div className="modal-actions">
        <button onClick={onAllow}>Yes, allow</button>
        <button onClick={onDeny}>No thanks</button>
      </div>
    </div>
  </div>
);

export default LocationPermissionModal;
