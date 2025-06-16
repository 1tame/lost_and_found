import React, { useState } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../ToastService';
import '../authStyles.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/users/forgot-password', { email });
      showSuccess('Password reset email sent. Check your inbox!');
    } catch (err) {
      showError(err.response?.data?.message || 'Error sending reset email');
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
