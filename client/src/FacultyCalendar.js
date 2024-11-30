import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';

function FacultyCalendar({ userRole }) {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ _id: '', title: '', start: '', end: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Function to fetch all events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        id: event._id, // Set the FullCalendar id as the MongoDB _id
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    // Fetch existing events when the component mounts
    fetchEvents();
  }, []);

  const handleDateClick = (selectInfo) => {
    if (userRole !== 'faculty') {
      alert('Only faculty members can create events.');
      return;
    }
    setIsEditing(false);
    setCurrentEvent({ _id: '', title: '', start: selectInfo.startStr, end: selectInfo.endStr });
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo) => {
    if (userRole !== 'faculty') {
      alert('Only faculty members can edit or delete events.');
      return;
    }

    setIsEditing(true);
    setCurrentEvent({
      _id: clickInfo.event.extendedProps._id, // Use the MongoDB _id here
      title: clickInfo.event.title,
      start: clickInfo.event.start ? clickInfo.event.start.toISOString().slice(0, 16) : '',
      end: clickInfo.event.end ? clickInfo.event.end.toISOString().slice(0, 16) : '',
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async () => {
    try {
      if (isEditing) {
        // Edit existing event
        const response = await axios.put(`http://localhost:3001/events/${currentEvent._id}`, {
          title: currentEvent.title,
          start: currentEvent.start,
          end: currentEvent.end,
        });
        console.log('Event updated successfully:', response.data);
      } else {
        // Create new event
        const response = await axios.post('http://localhost:3001/events', currentEvent);
        console.log('Event created successfully:', response.data);
      }
      setShowEventModal(false);
      fetchEvents(); // Fetch all events again to refresh
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`An error occurred while saving the event: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleEventDelete = async () => {
    try {
      console.log('Deleting event with ID:', currentEvent._id); // Log the event ID for debugging
      await axios.delete(`http://localhost:3001/events/${currentEvent._id}`);
      console.log('Event deleted successfully:', currentEvent._id);
      setShowEventModal(false);
      fetchEvents(); // Fetch all events again to refresh
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`An error occurred while deleting the event: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  return (
    <div className="faculty-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      {/* Modal Overlay */}
      {showEventModal && (
        <div className="event-modal-overlay" onClick={() => setShowEventModal(false)}></div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="event-modal">
          <h3>{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
          <label>Title:</label>
          <input
            type="text"
            value={currentEvent.title}
            onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
          />
          <label>Start Date and Time:</label>
          <input
            type="datetime-local"
            value={currentEvent.start}
            onChange={(e) => setCurrentEvent({ ...currentEvent, start: e.target.value })}
          />
          <label>End Date and Time:</label>
          <input
            type="datetime-local"
            value={currentEvent.end}
            onChange={(e) => setCurrentEvent({ ...currentEvent, end: e.target.value })}
          />
          <button onClick={handleEventSubmit} className="save-button">
            {isEditing ? 'Save Changes' : 'Create Event'}
          </button>
          {isEditing && (
            <button onClick={handleEventDelete} className="delete-button">
              Delete Event
            </button>
          )}
          <button onClick={() => setShowEventModal(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default FacultyCalendar;