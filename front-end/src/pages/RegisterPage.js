import '../authStyles.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../ToastService';

function RegisterPage() {
  const [user_name, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ new state
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return showError('Passwords do not match');
    }

    try {
      await axios.post('http://localhost:3001/api/users/add', {
        user_name, email, phone, password
      });
      showSuccess('Registered successfully');
      navigate('/');
    } catch (err) {
      showError('Registration failed');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="site-title">📝 Lost & Found System</h1>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={user_name}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="eye-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="eye-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit">Register</button>
      </form>

      <p className="auth-redirect">
        Already have an account?{' '}
        <span className="auth-link" onClick={() => navigate('/')}>
          Sign in here
        </span>
      </p>
    </div>
  );
}

export default RegisterPage;
