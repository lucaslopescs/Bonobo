import './App.css';
import React, { useEffect, useState } from 'react';
import Calendar from './calendar';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Call the backend API
    axios.get('http://localhost:3001')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', { 
        username, 
        password,
        role 
      });
      alert('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { 
        username, 
        password 
      });
      setIsLoggedIn(true);
      setUserRole(response.data.role);
      alert(`Login successful. Welcome ${response.data.username}`);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="App">
      <h1>{message}</h1>
      {!isLoggedIn ? (
        <div>
          <h2>Register or Login</h2>
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
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <p>Role: {userRole}</p>
          {userRole === 'faculty' && (
            <div>
              <button onClick={() => {/* Add event handler */}}>Create Event</button>
              <button onClick={() => {/* Add event handler */}}>Edit Events</button>
            </div>
          )}
          <Calendar userRole={userRole} />
        </div>
      )}
    </div>
  );
}

export default App;
