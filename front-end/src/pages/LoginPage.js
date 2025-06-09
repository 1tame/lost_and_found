import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      alert('Logged in!');
      // navigate to dashboard (later)
    } catch (err) {
      alert('Login failed');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
