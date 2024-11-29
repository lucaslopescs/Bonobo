const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date, 
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;