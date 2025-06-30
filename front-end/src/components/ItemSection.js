import React from 'react';
import ItemDisplayCard from './ItemDisplayCard';

const ItemSection = ({ title, items, loading, type }) => (
  <>
    <h3>{title}</h3>
    {loading ? (
      <p className="no-items">Loading...</p>
    ) : items.length === 0 ? (
      <p className="no-items">No items to display.</p>
    ) : (
      <div className="items-grid">
        {items.map((item) => (
          <ItemDisplayCard key={item.id || item.item_id} item={item} type={type} />
        ))}
      </div>
    )}
  </>
);

export default ItemSection;
