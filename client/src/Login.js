import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username,
        password,
        role: isRegistering ? role : undefined
      });
      
      if (response.data.success !== false) {
        onLoginSuccess(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data || 'An error occurred');
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isRegistering ? 'Please fill in your details' : 'Please login to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          )}

          <button type="submit" className="submit-button">
            {isRegistering ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegistering 
              ? 'Already have an account?' 
              : "Don't have an account?"}
            <button 
              className="toggle-button"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
