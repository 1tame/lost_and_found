import React from 'react';

const API_BASE_URL = 'http://localhost:3001';

const ItemDisplayCard = ({ item, type }) => {
  return (
    <div className="item-card-wrapper">
      {/* Image */}
      <div className="item-image-section">
        {item.image ? (
          <img
            src={`${API_BASE_URL}/uploads/${item.image}`}
            alt={item.item_type || 'Item'}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <p style={{ color: '#777' }}>No Image</p>
        )}
      </div>

      {/* Info */}
      <div className="item-content-section">
        <div>
          <h4>{item.item_type}</h4>

          {item.status && (
            <p className={`item-status ${item.status.toLowerCase()}`}>
              {item.status}
            </p>
          )}

          {item.city && (
            <p><strong>City:</strong> {item.city}</p>
          )}

          {item.description && (
            <p><strong>Description:</strong> {item.description}</p>
          )}
        </div>

        {/* Only for Lost Items */}
        {type === 'lost' && (item.user_name || item.email || item.phone) && (
          <div className="contact-info">
            {item.user_name && (
              <p><strong>Reported by:</strong> {item.user_name}</p>
            )}
            {item.email && (
              <p><strong>Email:</strong> <a href={`mailto:${item.email}`}>{item.email}</a></p>
            )}
            {item.phone && (
              <p><strong>Phone:</strong> <a href={`tel:${item.phone}`}>{item.phone}</a></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDisplayCard;
