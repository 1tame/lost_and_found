import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import SearchItemsPage from './pages/SearchItemsPage';
import ClaimsOnMyItems from './pages/ClaimsOnMyItems';
import MyClaimHistory from './pages/MyClaimsHistory';
import MyItemsPage from './pages/MyItemsPages';
import { ToastContainer } from 'react-toastify';
import { NotificationProvider } from './pages/NotificationContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { LocationProvider } from './pages/LocationContext';


function App() {
  return (
    <Router>
      <NotificationProvider>
         <LocationProvider> 
        <div>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="/search-item" element={<SearchItemsPage />} />
            <Route path="/view-claims" element={<ClaimsOnMyItems />} />
            <Route path="/my-claims" element={<MyClaimHistory />} />
            <Route path="/my-items" element={<MyItemsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
           <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          </Routes>
        </div>
         </LocationProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
