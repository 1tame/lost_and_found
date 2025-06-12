import '../authStyles.css'; // 👈 import the style
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { showError } from '../ToastService';


function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


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
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <div className="password-wrapper">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <span
    className="eye-toggle"
    onClick={() => setShowPassword(!showPassword)}
    title={showPassword ? 'Hide Password' : 'Show Password'}
  >
    {showPassword ? '👁' : '👁️‍🗨'} {/* 👁 for show, 👁️‍🗨 for hide */}
  </span>
</div>

  <button type="submit">Login</button>
</form>

<p className="auth-redirect">
  Don't have an account?{' '}
  <span className="auth-link" onClick={() => navigate('/register')}>
    Sign up here
  </span>
</p>
    </div>
  );
}

export default LoginPage;
