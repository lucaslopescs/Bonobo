import axios from 'axios';
import React, { useState } from "react";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username,
        password,
        role: isRegistering ? role : undefined
      });
      
      alert(response.data.message);
      // You might want to redirect or update app state here
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data || 'An error occurred');
    }
  }

  return (
    <div className="Login">
      <h1>{isRegistering ? 'Register' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {isRegistering && (
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        )}
        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
}

export default Login;