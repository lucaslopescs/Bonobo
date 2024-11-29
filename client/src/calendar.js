// src/components/Calendar.js
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react'; // FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // For month view
import timeGridPlugin from '@fullcalendar/timegrid'; // For week and day views
import interactionPlugin from '@fullcalendar/interaction'; // Enables drag and drop
import FacultyCalendar from './FacultyCalendar';

function Calendar({ userRole }) {
  const [events, setEvents] = useState([
    { title: 'Meeting', date: '2024-10-24' },
    { title: 'Conference', date: '2024-10-27' },
    { title: 'Workshop', start: '2024-10-28T10:00:00', end: '2024-10-28T12:00:00' },
  ]);

  const handleEventClick = (info) => {
    if (userRole === 'faculty') {
      // Faculty can edit/delete events
      const action = window.confirm('Would you like to edit or delete this event?');
      if (action) {
        // Add edit/delete functionality
      }
    } else {
      // Students can only view event details
      alert(`Event: ${info.event.title}`);
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={userRole === 'faculty'} // Only faculty can edit
        selectable={userRole === 'faculty'} // Only faculty can select dates
        eventClick={handleEventClick}
        select={userRole === 'faculty' ? (selectInfo) => {
          const title = prompt('Enter event title:');
          if (title) {
            setEvents([...events, {
              title,
              start: selectInfo.startStr,
              end: selectInfo.endStr,
            }]);
          }
        } : undefined}
      />
    </div>
  );
}

export default Calendar;