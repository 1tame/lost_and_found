import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../ToastService';
import '../authStyles.css';

const ResetPasswordPage = () => {
  const { token } = useParams(); // reset token from email
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return showError('Passwords do not match');

    try {
      await axios.post(`http://localhost:3001/api/users/reset-password/${token}`, { password });
      showSuccess('Password updated! Please log in.');
      navigate('/');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
