const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String, // New description field
  start: Date,
  end: Date,
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // List of students registered for the event
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;