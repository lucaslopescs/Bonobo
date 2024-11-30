import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

function Calendar({ userRole, username }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // State to store filtered events
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [showRegisteredEvents, setShowRegisteredEvents] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State to store the search term

  // Function to fetch all events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        id: event._id, // Set the FullCalendar id as the MongoDB _id
      }));
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents); // Initially, all events are displayed
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Function to fetch registered events for the student
  const fetchRegisteredEvents = async () => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      const response = await axios.get(`http://localhost:3001/events/registered/${username}`);
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      alert(`An error occurred while fetching your registered events: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  useEffect(() => {
    // Fetch existing events when the component mounts
    fetchEvents();
    // Fetch registered events when the component mounts
    fetchRegisteredEvents();
  }, []);

  // Handle student clicking on an event to register
  const handleEventClick = (info) => {
    if (userRole === 'student') {
      setSelectedEvent(info.event);
      setShowRegistrationModal(true);
    } else {
      alert('Only students can register for events.');
    }
  };

  // Handle registration for the event
  const handleRegisterForEvent = async () => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      const eventId = selectedEvent.id;
      const response = await axios.post(`http://localhost:3001/events/${eventId}/register`, {
        username,
      });
      console.log('Registration response:', response.data);
      alert('You have successfully registered for the event.');

      setShowRegistrationModal(false);
      
      // Re-fetch events to update UI after registration
      fetchEvents(); 
      fetchRegisteredEvents(); // Re-fetch registered events to update state
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(`An error occurred while registering for the event: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Handle unregistration from the event
  const handleUnregisterFromEvent = async (eventId) => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      const response = await axios.delete(`http://localhost:3001/events/${eventId}/unregister`, {
        data: { username }
      });
      console.log('Unregistration response:', response.data);
      alert('You have successfully unregistered from the event.');

      // Re-fetch registered events to update state
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(`An error occurred while unregistering from the event: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter events based on the search term
    if (term) {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events); // If search term is cleared, show all events
    }
  };

  return (
    <div className="calendar-container">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchInputChange}
          placeholder="Search for events..."
          className="search-input"
        />
      </div>

      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents} // Display filtered events
        editable={userRole === 'faculty'} // Only faculty can edit
        selectable={userRole === 'faculty'} // Only faculty can select dates
        eventClick={handleEventClick}
      />

      {/* Modal Overlay for Registration */}
      {showRegistrationModal && (
        <div className="event-modal-overlay" onClick={() => setShowRegistrationModal(false)}></div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="event-modal">
          <h3>Register for Event</h3>
          <p>Event: {selectedEvent.title}</p>
          <p>Start: {new Date(selectedEvent.start).toLocaleDateString()} at {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p>End: {selectedEvent.end ? new Date(selectedEvent.end).toLocaleDateString() + ' at ' + new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Specified'}</p>
          <button onClick={handleRegisterForEvent} className="save-button">
            Register
          </button>
          <button onClick={() => setShowRegistrationModal(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}

      {/* Button to View Registered Events */}
      <button
        onClick={() => {
          fetchRegisteredEvents(); // Ensure registered events are fetched when opening
          setShowRegisteredEvents(true);
        }}
        className="view-registered-button"
      >
        View Registered Events
      </button>

      {/* List of Registered Events */}
      {showRegisteredEvents && (
        <div className="registered-events-list">
          <h3>Your Registered Events</h3>
          {registeredEvents.length > 0 ? (
            <ul>
              {registeredEvents.map(event => (
                <li key={event._id} className="registered-event-item">
                  <div className="event-details">
                    <strong>{event.title}</strong>
                    <div>
                      <span>Start: {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><br />
                      <span>End: {event.end ? new Date(event.end).toLocaleDateString() + ' at ' + new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Specified'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleUnregisterFromEvent(event._id)} className="unregister-button">
                    Unregister
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not registered for any events.</p>
          )}
          <button onClick={() => setShowRegisteredEvents(false)} className="close-registered-button">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Calendar;