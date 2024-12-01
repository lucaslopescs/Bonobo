import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';

function FacultyCalendar({ userRole }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ _id: '', title: '', start: '', end: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  useEffect(() => {
    // Fetch existing events when the component mounts
    fetchEvents();
  }, []);

  const handleDateClick = (selectInfo) => {
    if (userRole !== 'faculty') {
      alert('Only faculty members can create events.');
      return;
    }

    try {
      // Get the selected date from the calendar
      let selectedDate = new Date(selectInfo.dateStr + 'T00:00:00');

      // Set the current time for the start
      const currentTime = new Date();
      selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);

      // Set the end time to 1 hour after the start time
      let endDate = new Date(selectedDate.getTime() + 60 * 60 * 1000);

      // Format start and end date for datetime-local inputs
      const startStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}T${selectedDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;

      const endStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}T${endDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      // Set the current event with pre-filled start and end date/time
      setIsEditing(false);
      setCurrentEvent({ _id: '', title: '', start: startStr, end: endStr });
      setShowEventModal(true);
    } catch (error) {
      console.error('Error handling date click:', error);
      alert('There was an error selecting the date. Please try again.');
    }
  };

  const handleEventClick = (clickInfo) => {
    if (userRole !== 'faculty') {
      alert('Only faculty members can edit or delete events.');
      return;
    }

    setIsEditing(true);
    setCurrentEvent({
      _id: clickInfo.event.extendedProps._id,
      title: clickInfo.event.title,
      start: clickInfo.event.start ? clickInfo.event.start.toISOString().slice(0, 16) : '',
      end: clickInfo.event.end ? clickInfo.event.end.toISOString().slice(0, 16) : '',
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async () => {
    try {
      const currentTime = new Date();
      const start = new Date(currentEvent.start);
      const end = new Date(currentEvent.end);

      if (start < currentTime) {
        alert('Cannot create or update an event in the past');
        return;
      }

      if (start >= end) {
        alert('End date must be after start date');
        return;
      }

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
      alert(
        `An error occurred while saving the event: ${
          error.response ? error.response.data.message : error.message
        }`
      );
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
      alert(
        `An error occurred while deleting the event: ${
          error.response ? error.response.data.message : error.message
        }`
      );
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const filtered = events.filter((event) =>
        event.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events); // If search term is cleared, show all events
    }
  };

  const handleShowSearchResults = () => {
    if (searchTerm) {
      setShowSearchResults(true);
    } else {
      alert('Please enter a search term.');
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const handleEventCardClick = (event) => {
    setIsEditing(true);
    setCurrentEvent({
      _id: event._id,
      title: event.title,
      start: event.start,
      end: event.end,
    });
    setShowEventModal(true);
  };

  return (
    <div className="faculty-calendar">
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

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        events={filteredEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      {/* Search Results Modal */}
      {showSearchResults && (
        <>
          <div className="search-results-modal-overlay" onClick={handleCloseSearchResults}></div>
          <div className="search-results-modal">
            <h3>Search Results</h3>
            {filteredEvents.length > 0 ? (
              <ul className="search-results-list">
                {filteredEvents.map((event) => (
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

      {/* Modal Overlay */}
      {showEventModal && (
        <div className="event-modal-overlay" onClick={() => setShowEventModal(false)}></div>
      )}

      {/* Modern Event Modal */}
      {showEventModal && (
        <div className="modern-event-modal">
          <h3>{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
          <div className="modal-content">
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
          </div>
          <div className="modal-buttons">
            <button onClick={handleEventSubmit} className="modern-save-button">
              {isEditing ? 'Save Changes' : 'Create Event'}
            </button>
            {isEditing && (
              <button onClick={handleEventDelete} className="modern-delete-button">
                Delete Event
              </button>
            )}
            <button onClick={() => setShowEventModal(false)} className="modern-cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyCalendar;