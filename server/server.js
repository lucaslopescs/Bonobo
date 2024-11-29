// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');
const Event = require('./Event'); // Import Event model
const checkRole = require('./middleware/roleMiddleware'); // Import role middleware

dotenv.config();

// Express setup
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Middleware for authentication
// Middleware for authentication
function authenticateToken(req, res, next) {
  // More robust token extraction
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied, token missing' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}


// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!['Student', 'Faculty'].includes(role)) {
      return res.status(400).send('Invalid role provided');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Detailed error:', error);
res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign(
        { username: user.username, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({ accessToken });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

// Faculty creates an event
app.post('/events', authenticateToken, checkRole('Faculty'), async (req, res) => {
  try {
    const { title, date } = req.body;
    const event = new Event({
      title,
      date,
      faculty: req.user._id,
    });
    await event.save();
    res.status(201).send('Event created successfully');
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

// Student registers for an event
app.post('/events/:eventId/register', authenticateToken, checkRole('Student'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send('Event not found');

    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).send('You are already registered for this event');
    }

    event.registeredStudents.push(req.user._id);
    await event.save();
    res.status(200).send('Successfully registered for the event');
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

// Get all events (accessible to all authenticated users)
app.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find().populate('faculty', 'username');
    res.status(200).json(events);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

app.post('/events/calendar', authenticateToken, checkRole('Faculty'), async (req, res) => {
  try {
    const events = req.body; // Expecting an array of events
    const createdEvents = await Event.insertMany(
      events.map(event => ({
        title: event.title,
        start: event.start,
        end: event.end || event.start, // Handle events without an 'end' time
        faculty: req.user._id,
      }))
    );
    res.status(201).json(createdEvents);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });

  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

