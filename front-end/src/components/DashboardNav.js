import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotification } from '../pages/NotificationContext';

const DashboardNav = () => {
  const { newClaimCount, updatedClaimCount } = useNotification();

  return (
    <nav className="dashboard-nav">
      <NavLink to="/dashboard" end>🏠 Home</NavLink>
      <NavLink to="/add-item">➕ Add Item</NavLink>
      <NavLink to="/search-item">🔍 Search</NavLink>
      <NavLink to="/my-items">📦 My Items</NavLink>
      <NavLink to="/my-claims">
        📄 My Claims
        {updatedClaimCount > 0 && <span className="badge">{updatedClaimCount}</span>}
      </NavLink>
      <NavLink to="/view-claims">
        📥 Claims on My Items
        {newClaimCount > 0 && <span className="badge">{newClaimCount}</span>}
      </NavLink>
    </nav>
  );
};

export default DashboardNav;
