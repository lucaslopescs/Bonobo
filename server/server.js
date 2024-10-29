// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('School Event Manager API');
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const cors = require('cors');

// Enable CORS
app.use(cors());

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios'; // For making API calls

function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from the backend (e.g., JSONbin.io or your own backend API)
    axios.get('http://localhost:3000/events') // Replace with your API endpoint
      .then((response) => {
        setEvents(response.data); // Assume the response contains an array of events
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, []); // Empty dependency array ensures this runs only once after component mounts

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events} // Events are now fetched from the backend
        editable={true}
        selectable={true}
        eventClick={(info) => {
          alert(`Event: ${info.event.title}`);
        }}
      />
    </div>
  );
}

export default Calendar;