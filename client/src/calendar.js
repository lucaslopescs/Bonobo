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
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRegisteredEvents, setShowRegisteredEvents] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        id: event._id,
      }));
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      const response = await axios.get(`http://localhost:3001/events/registered/${username}`);
      const sortedEvents = response.data.sort((a, b) => new Date(a.start) - new Date(b.start));
      setRegisteredEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      alert(`An error occurred while fetching your registered events: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents(); // Fetch registered events on component mount
  }, []);

  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  };

  const handleShowSearchResults = () => {
    if (searchTerm) {
      setShowSearchResults(true);
    } else {
      alert("Please enter a search term.");
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const handleViewRegisteredEvents = () => {
    fetchRegisteredEvents();
    setShowRegisteredEvents(true);
  };

  const handleCloseRegisteredEvents = () => {
    setShowRegisteredEvents(false);
  };

  const handleEventCardClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleRegisterForEvent = async () => {
    try {
      if (!username) {
        alert('Username not found. Please log in again.');
        return;
      }
      const eventId = selectedEvent.id;
      await axios.post(`http://localhost:3001/events/${eventId}/register`, {
        username,
      });
      alert('You have successfully registered for the event.');
      setShowEventModal(false);
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(`An error occurred while registering for the event: ${error.response ? error.response.data.message : error.message}`);
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
      setShowEventModal(false);
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(`An error occurred while unregistering from the event: ${error.response ? error.response.data.message : error.message}`);
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
        <button onClick={handleShowSearchResults} className="search-button">
          Search
        </button>
      </div>

      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}
        editable={userRole === 'faculty'}
        selectable={userRole === 'faculty'}
        eventClick={(info) => handleEventCardClick(info.event)}
      />

      {/* View Registered Events Button */}
      {userRole === 'student' && (
        <button onClick={handleViewRegisteredEvents} className="view-registered-button">
          View Registered Events
        </button>
      )}

      {/* Search Results Modal */}
      {showSearchResults && (
        <>
          <div className="search-results-modal-overlay" onClick={handleCloseSearchResults}></div>
          <div className="search-results-modal">
            <h3>Search Results</h3>
            {filteredEvents.length > 0 ? (
              <ul className="search-results-list">
                {filteredEvents.map(event => (
                  <li key={event._id} className="search-result-item">
                    <div className="event-card" onClick={() => handleEventCardClick(event)}>
                      <h4>{event.title}</h4>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events match your search criteria.</p>
            )}
            <button onClick={handleCloseSearchResults} className="close-search-results-button">
              Close
            </button>
          </div>
        </>
      )}

      {/* Registered Events Modal */}
      {showRegisteredEvents && (
        <>
          <div className="registered-events-modal-overlay" onClick={handleCloseRegisteredEvents}></div>
          <div className="registered-events-modal">
            <h3>Your Registered Events</h3>
            {registeredEvents.length > 0 ? (
              <ul className="registered-events-list">
                {registeredEvents.map(event => (
                  <li key={event._id} className="registered-event-item">
                    <div className="event-card" onClick={() => handleEventCardClick(event)}>
                      <h4>{event.title}</h4>
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
            <button onClick={handleCloseRegisteredEvents} className="close-registered-button">
              Close
            </button>
          </div>
        </>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <>
          <div className="event-details-modal-overlay" onClick={() => setShowEventModal(false)}></div>
          <div className="event-details-modal">
            <h3>Event Details</h3>
            <div className="event-details-content">
              <h4>{selectedEvent.title}</h4>
              <p><strong>Description:</strong> {selectedEvent.description || "No description provided."}</p>
              <p><strong>Start Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()} at {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>End Date:</strong> {selectedEvent.end ? `${new Date(selectedEvent.end).toLocaleDateString()} at ${new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Not Specified"}</p>
            </div>
            {/* Register/Unregister buttons only for unregistered events or selected event from search */}
            {userRole === 'student' && !registeredEvents.some(event => event._id === selectedEvent.id) && !showRegisteredEvents && (
              <button onClick={handleRegisterForEvent} className="register-button">
                Register
              </button>
            )}
            <button onClick={() => setShowEventModal(false)} className="close-event-modal-button">
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Calendar;