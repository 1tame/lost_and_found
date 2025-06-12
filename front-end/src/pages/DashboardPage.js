import '../dashboardStyles.css'; 
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error('Invalid token');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/items/view');
        setLostItems(res.data.items);
      } catch (error) {
        console.error('Failed to fetch lost items:', error);
      }
    };

    fetchLostItems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        {user && <p>Welcome, {user.user_name}</p>}
      </header>

      <nav className="dashboard-nav">
        <Link to="/add-item">Add Item</Link>
        <Link to="/search-item">Search Items</Link>
        <Link to="/my-claims">My Claims</Link>
        <Link to="/view-claims">Claims on My Items</Link>
                      <Link to="/dashboard">Home page</Link>
        
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <section className="dashboard-section">
        <h3>Recently Lost Items</h3>
        {lostItems.length === 0 ? (
          <p>No lost items available.</p>
        ) : (
          <div className="items-grid">
            {lostItems.map(item => (
             <div key={item.item_id} className="item-card">
  <h4>{item.item_type}</h4>
  <p><strong>City:</strong> {item.city}</p>
  <p><strong>Description:</strong> {item.description}</p>
  <p><strong>Reported by:</strong> {item.user_name}</p>

  <p>
    <strong>Email:</strong>{' '}
    <a href={`mailto:${item.email}`} className="contact-link">
      {item.email}
    </a>
  </p>

  <p>
    <strong>Phone:</strong>{' '}
    <a href={`tel:${item.phone}`} className="contact-link">
      {item.phone}
    </a>
  </p>

  {item.image && (
    <img
      src={`http://localhost:3001/uploads/${item.image}`}
      alt="item"
    />
  )}
</div>

            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
