import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data.map(event => ({
          title: event.title,
          start: event.start,
          end: event.end,
        })));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleEventAdd = async (eventInfo) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3001/events/calendar',
        [{ title: eventInfo.event.title, start: eventInfo.event.start, end: eventInfo.event.end }],
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      alert('Event saved successfully');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        selectable={true}
        eventAdd={(eventInfo) => handleEventAdd(eventInfo)}
        eventClick={(info) => {
          alert(`Event: ${info.event.title}`);
        }}
      />
    </div>
  );
}

export default Calendar;