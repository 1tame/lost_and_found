import React from 'react';

const DashboardHeader = ({ userName, onLogout }) => (
  <header className="dashboard-header">
    <h2>Welcome, {userName || 'User'}!</h2>
    <button className="logout-button" onClick={onLogout}>Logout</button>
  </header>
);

export default DashboardHeader;
