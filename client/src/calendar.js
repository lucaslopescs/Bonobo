import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

function Calendar({ userRole, username }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [showRegisteredEvents, setShowRegisteredEvents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ _id: '', title: '', start: '', end: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        id: event._id
      }));
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch registered events for the user
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
      alert(error.response?.data.message || 'An error occurred while fetching your registered events.');
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const handleEventClick = (info) => {
    if (userRole === 'student') {
      setSelectedEvent(info.event);
      setShowRegistrationModal(true);
    } else {
      alert('Only students can register directly from the calendar. Use the search popup to edit/delete events as faculty.');
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      await axios.post(`http://localhost:3001/events/${eventId}/register`, { username });
      alert('You have successfully registered for the event.');
      setShowRegistrationModal(false);
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.response?.data.message || 'An error occurred while registering.');
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      await axios.delete(`http://localhost:3001/events/${eventId}/unregister`, {
        data: { username }
      });
      alert('You have successfully unregistered from the event.');
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(error.response?.data.message || 'An error occurred while unregistering.');
    }
  };

  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(term.toLowerCase())
      );
      filtered.sort((a, b) => new Date(a.start) - new Date(b.start));
      setFilteredEvents(filtered);
      setShowSearchResults(true);
    } else {
      setFilteredEvents(events);
      setShowSearchResults(false);
    }
  };

  const handleEditEvent = (event) => {
    if (userRole !== 'faculty') return;
    setIsEditing(true);
    setCurrentEvent({
      _id: event._id,
      title: event.title,
      start: event.start ? new Date(event.start).toISOString().slice(0,16) : '',
      end: event.end ? new Date(event.end).toISOString().slice(0,16) : '',
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/events/${currentEvent._id}`, {
          title: currentEvent.title,
          start: currentEvent.start,
          end: currentEvent.end,
        });
      } else {
        await axios.post('http://localhost:3001/events', currentEvent);
      }
      setShowEventModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.response?.data.message || 'An error occurred while saving the event.');
    }
  };

  const handleEventDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/events/${currentEvent._id}`);
      setShowEventModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.response?.data.message || 'An error occurred while deleting the event.');
    }
  };

  const isStudentRegistered = (eventId) => {
    return registeredEvents.some(ev => ev._id === eventId);
  };

  // Sort the registered events by upcoming start date before displaying
  const sortedRegisteredEvents = [...registeredEvents].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );

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
        events={events}
        editable={userRole === 'faculty'}
        selectable={userRole === 'faculty'}
        eventClick={handleEventClick}
      />

      {/* Registration Modal (Students) */}
      {showRegistrationModal && selectedEvent && (
        <>
          <div className="event-modal-overlay" onClick={() => setShowRegistrationModal(false)}></div>
          <div className="event-modal">
            <h3>Register for Event</h3>
            <p>Event: {selectedEvent.title}</p>
            <p>Start: {new Date(selectedEvent.start).toLocaleDateString()} at {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>End: {selectedEvent.end ? new Date(selectedEvent.end).toLocaleDateString() + ' at ' + new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Specified'}</p>
            <button onClick={() => handleRegisterForEvent(selectedEvent.id)} className="save-button">Register</button>
            <button onClick={() => setShowRegistrationModal(false)} className="cancel-button">Cancel</button>
          </div>
        </>
      )}

      {/* View Registered Events Button */}
      <button
        onClick={() => {
          fetchRegisteredEvents();
          setShowRegisteredEvents(!showRegisteredEvents);
        }}
        className="view-registered-button"
      >
        View Registered Events
      </button>

      {/* Registered Events at Bottom (now sorted by upcoming date) */}
      <div className={`registered-events-list ${showRegisteredEvents ? 'open' : ''}`}>
        <h3>Your Registered Events</h3>
        {sortedRegisteredEvents.length > 0 ? (
          <ul>
            {sortedRegisteredEvents.map(event => (
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

      {/* Search Results Popup */}
      {showSearchResults && (
        <>
          <div className="event-modal-overlay" onClick={() => setShowSearchResults(false)}></div>
          <div className="event-modal" style={{maxHeight: '80vh', overflowY:'auto'}}>
            <h3>Search Results</h3>
            {filteredEvents.length > 0 ? (
              <ul>
                {filteredEvents.map(event => (
                  <li key={event._id} className="registered-event-item">
                    <div className="event-details">
                      <strong>{event.title}</strong>
                      <div>
                        <span>Start: {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span><br />
                        <span>End: {event.end ? new Date(event.end).toLocaleDateString() + ' at ' + new Date(event.end).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : 'Not Specified'}</span>
                      </div>
                    </div>
                    {userRole === 'student' ? (
                      isStudentRegistered(event._id) ? (
                        <button onClick={() => handleUnregisterFromEvent(event._id)} className="unregister-button">
                          Unregister
                        </button>
                      ) : (
                        <button onClick={() => handleRegisterForEvent(event._id)} className="save-button">
                          Register
                        </button>
                      )
                    ) : userRole === 'faculty' ? (
                      <>
                        <button onClick={() => handleEditEvent(event)} className="save-button">Edit</button>
                        <button onClick={() => {setCurrentEvent(event); handleEventDelete();}} className="delete-button">Delete</button>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events found.</p>
            )}
            <button onClick={() => setShowSearchResults(false)} className="close-registered-button">
              Close
            </button>
          </div>
        </>
      )}

      {/* Event Edit/Create Modal (Faculty) */}
      {showEventModal && (
        <>
          <div className="event-modal-overlay" onClick={() => setShowEventModal(false)}></div>
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
        </>
      )}
    </div>
  );
}

export default Calendar;