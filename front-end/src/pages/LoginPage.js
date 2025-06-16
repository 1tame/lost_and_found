import '../authStyles.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { showError } from '../ToastService';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/users/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      localStorage.setItem('userId', decoded.id);
      localStorage.setItem('userName', decoded.user_name);
      navigate('/dashboard');
    } catch (err) {
      showError('Login failed');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="site-title">🔐 Lost & Found System</h1>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-wrapper">
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
            {showPassword ? '👁' : '👁️‍🗨'}
          </span>
        </div>
        
        <button type="submit">Login</button>
      </form>

      

      <p className="auth-redirect">
        <div className="forgot-password" onClick={() => navigate('/forgot-password')}>
         Forgot Password?</div>
         
        Don’t have an account?{' '}
        <span className="auth-link" onClick={() => navigate('/register')}>
          Sign up here
        </span>
      </p>
    </div>
  );
}

export default LoginPage;
