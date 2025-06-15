import '../authStyles.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../ToastService'; // 👈 Import Toasts

function RegisterPage() {
  const [user_name, setUserName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/users/add', {
        user_name, email, phone, password
      });
      showSuccess('Registered successfully'); // ✅ Toast instead of alert
      navigate('/');
    } catch (err) {
      showError('Registration failed');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={user_name} onChange={(e) => setUserName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
