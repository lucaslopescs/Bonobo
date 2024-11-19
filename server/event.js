const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  start: Date,
  end: Date
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event; 