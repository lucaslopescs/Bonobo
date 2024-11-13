// LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', { username, password });
      setIsRegistered(true);
      alert('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      alert(response.data);
      if (response.status === 200) {
        // Update App.js state here to set user as authenticated
        setIsAuthenticated(true); // This could be passed down as a prop to handle login state
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <h2>{isRegistered ? 'Login' : 'Register'}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {!isRegistered ? (
        <button onClick={handleRegister}>Register</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      <button onClick={() => setIsRegistered(!isRegistered)}>
        {isRegistered ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  );
}

export default LoginPage;
