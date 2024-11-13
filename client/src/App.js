import './App.css';
import React, { useEffect, useState } from 'react';
import Calendar from './Calendar'; 
import axios from 'axios';
import Banner from './Banner.js';

function App() {
  const [message, setMessage] = useState('');

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

  return (
    <div className="App">
      <h1>{message}</h1> 
      <Banner />
      <Calendar /> 
    </div>
  );
}

export default App;