import './App.css';
import React, { useEffect, useState } from 'react';
import Calendar from './calendar';
import axios from 'axios';
import Login from './login';

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

 // const handleLoginSuccess = (role, username) => {
   // console.log(`User ${username} logged in as ${role}`);
  //  setCurrentUser({ username, role });
  //};


  const handleLoginSuccess = (response) => {
    console.log(`User ${username} logged in as ${response.role}`);
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
           <h2>Welcome, {username}!
             <p>Role: {userRole}
               <button 
                 onClick={handleLogout} 
                 className="logout-button"
                 >
                Logout
                </button>
             </p>
           </h2>
           {userRole === 'faculty' && (
              <div className="faculty-controls">
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