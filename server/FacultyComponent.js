// FacultyComponent.js
import React, { useState } from 'react';
import axios from 'axios';

function FacultyComponent() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreateEvent = async () => {
    try {
      console.log('Creating event:', title);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/events', { title, date }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('Event created successfully');
      setTitle(''); // Reset the title field
      setDate('');  // Reset the date field
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  return (
    <div className="faculty-component">
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
    </div>
  );
}

export default FacultyComponent;
