// src/components/Calendar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react'; // FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // For month view
import timeGridPlugin from '@fullcalendar/timegrid'; // For week and day views
import interactionPlugin from '@fullcalendar/interaction'; // Enables drag and drop

function Calendar() {
  const [events, setEvents] = useState([
    { title: 'Meeting', date: '2024-10-24' },
    { title: 'Conference', date: '2024-10-27' },
    { title: 'Workshop', start: '2024-10-28T10:00:00', end: '2024-10-28T12:00:00' },
  ]);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching events for calendar');
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/events', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        // Transform the response data to match the expected format for FullCalendar
        const transformedEvents = response.data.map(event => ({
          title: event.title,
          start: event.date,
          end: event.end ? event.end : event.date,
        }));
        setEvents(transformedEvents);
        console.log('Events fetched successfully:', response.data);
      } catch (error) {
        console.error('Error fetching events for calendar:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth" // Set the initial view to a month calendar
        events={events} // Pass the events array to the calendar
        editable={true} // Enable event drag and drop
        selectable={true} // Allow users to select time slots
        eventClick={(info) => {
          alert(`Event: ${info.event.title}`);
        }}
      />
    </div>
  );
}

export default Calendar;