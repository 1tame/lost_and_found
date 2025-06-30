// src/pages/DashboardPage.js
import '../dashboardStyles.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from './NotificationContext';
import { useLocation as useAppLocation } from './LocationContext';
import axios from 'axios';
import DashboardHeader from '../components/DashboardHeader';
import DashboardNav from '../components/DashboardNav';
import ItemSection from '../components/ItemSection';
import LocationPermissionModal from '../components/LocationPermissionModal';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:3001';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingLost, setIsLoadingLost] = useState(false);

  const navigate = useNavigate();
  const { location: appLocation, showLocationModal, handleAllowLocation, handleDenyLocation } = useAppLocation();
  const { newClaimCount, setNewClaimCount, updatedClaimCount, setUpdatedClaimCount } = useNotification();

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
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!appLocation?.latitude || !appLocation?.longitude) return;
    setIsLoadingNearby(true);
    axios.get(`${API_BASE_URL}/api/items/nearby?latitude=${appLocation.latitude}&longitude=${appLocation.longitude}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setNearbyItems(res.data.nearby || []))
      .catch(() => setNearbyItems([]))
      .finally(() => setIsLoadingNearby(false));
  }, [appLocation]);

  useEffect(() => {
    if (!appLocation?.latitude || !appLocation?.longitude) return;
    setIsLoadingLost(true);
    axios.get(`${API_BASE_URL}/api/items/nearby-lost?latitude=${appLocation.latitude}&longitude=${appLocation.longitude}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setLostItems(res.data.nearbyLost || []))
      .catch(() => setLostItems([]))
      .finally(() => setIsLoadingLost(false));
  }, [appLocation]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.all([
      axios.get(`${API_BASE_URL}/api/notifications/owner/new-claims`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE_URL}/api/notifications/claimant/status-updates`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]).then(axios.spread((ownerRes, claimantRes) => {
      setNewClaimCount(ownerRes.data.newClaimCount || 0);
      setUpdatedClaimCount(claimantRes.data.updatedClaimCount || 0);
    })).catch(() => console.error('Failed to fetch notifications'));
  }, [setNewClaimCount, setUpdatedClaimCount]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      {showLocationModal && (
        <LocationPermissionModal
          onAllow={handleAllowLocation}
          onDeny={handleDenyLocation}
        />
      )}

      <DashboardHeader userName={user?.user_name} onLogout={handleLogout} />
      <DashboardNav />

      <section className="dashboard-content">
        {appLocation && (
          <ItemSection
            title="📍 Found Items Near You"
            items={nearbyItems}
            loading={isLoadingNearby}
            type="found"
          />
        )}

        <ItemSection
          title={`🧭 Lost Items ${appLocation ? 'Near You' : 'Reported'}`}
          items={lostItems}
          loading={isLoadingLost}
          type="lost"
        />
      </section>
      <Footer />  {}
    </div>
  );
}

export default DashboardPage;
