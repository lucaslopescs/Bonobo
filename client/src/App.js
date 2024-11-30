import './App.css';
import React, { useEffect, useState } from 'react';
import FacultyCalendar from './FacultyCalendar';
import Calendar from './calendar';  
import axios from 'axios';
import Login from './Login';

function App() {
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');

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

  const handleLoginSuccess = (response) => {
    console.log(`User ${response.username} logged in as ${response.role}`);
    setIsLoggedIn(true);
    setUserRole(response.role);
    setUsername(response.username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserRole(null);
    alert('You have logged out successfully.');
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="dashboard">
          <h2>
            Welcome, {username}!
            <p>
              Role: {userRole}
              <button 
                onClick={handleLogout} 
                className="logout-button"
              >
                Logout
              </button>
            </p>
          </h2>

          {/* Conditional Rendering for Calendars based on User Role */}
          {userRole === 'faculty' ? (
            <FacultyCalendar userRole={userRole} /> // Use FacultyCalendar for faculty
          ) : (
            <div>
              <p>Welcome, student! You can view events and register for them.</p>
              <Calendar userRole={userRole} username={username} /> // Use simple Calendar for students with username
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;