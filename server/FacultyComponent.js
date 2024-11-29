import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './Calendar';

function FacultyComponent({ userRole }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreateEvent = async () => {
    try {
      // Handling Undefined userRole
      if (!userRole || userRole !== 'Faculty') {
        alert('Only Faculty members can create events.');
        return;
      }

      // Token Check Before Request
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User not authenticated. Please log in.');
        return;
      }

      await axios.post('http://localhost:3001/events', { title, date }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Event created successfully');
      setTitle('');
      setDate('');
      setShowForm(false);
    } catch (error) {
      // Error Handling for Network Issues
      console.error('Error creating event:', error);
      alert('Network issue or server error while creating the event');
    }
  };

  return (
    <div className="faculty-dashboard">
      <h2>Faculty Dashboard</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add New Event'}
      </button>
      {showForm && (
        <div className="create-event-form">
          <h3>Create New Event</h3>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={handleCreateEvent}>Create Event</button>
        </div>
      )}
      <Calendar />
    </div>
  );
}

export default FacultyComponent;