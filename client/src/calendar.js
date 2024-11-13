// src/components/Calendar.js
import React, { useState } from 'react';
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
        headerToolbar={{
          left: 'title',
          //center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }} 
        footerToolbar={{
          left: 'prev', 
          right: 'next',
        }} 
        height = "auto" //automatically adjust height      
      />
    </div>
  );
}

export default Calendar;