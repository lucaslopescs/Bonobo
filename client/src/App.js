// App.js

import './App.css';
import React, { useEffect, useState } from 'react';
import Calendar from './calendar';
import axios from 'axios';
import FacultyComponent from './FacultyComponent';

function App() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

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
      await axios.post('http://localhost:3001/register', { username, password, role: 'Faculty' }); // Adjusted to allow role input
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
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken); // Save token
      const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
      alert('Login successful');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Invalid credentials');
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (userRole !== 'Faculty') {
        alert('Only Faculty members can create events.');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/events', { title, date }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('Event created successfully');
      setTitle('');
      setDate('');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  return (
    <div className="App">
      <h1>{message}</h1>
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
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>

      {isAuthenticated && userRole === 'Faculty' && <FacultyComponent userRole={userRole} />}

      <Calendar />
    </div>
  );
}

export default App;
