const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Event = require('./event');
const User = require('./User');

dotenv.config();  // Load environment variables

// MongoDB URI
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
  })
  .catch((err) => {
    console.error('MongoDB Atlas connection error:', err);
    process.exit(1);
  });

// Express setup
const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store verification codes in memory (can be replaced with a dedicated collection)
const pendingVerifications = {};

// Register route (only sends verification code)
app.post('/register', async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    console.log('Register request received:', { username, email, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Generate a verification code
    const verificationCode = crypto.randomInt(100000, 999999);
    pendingVerifications[email] = { username, password, role, verificationCode };

    console.log('Verification code generated for:', email, 'Code:', verificationCode);

    // Send the verification code via email
    await transporter.sendMail({
      to: email,
      subject: 'Email Verification Code',
      html: `<h2>Welcome to Bonobo!</h2><p>Your verification code is:</p><h3>${verificationCode}</h3>`,
    });

    console.log('Verification email sent to:', email);

    res.status(200).json({
      success: true,
      message: 'Verification code sent. Please check your email to complete the registration process.',
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// Verify code and complete registration
app.post('/verify-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Check if there's a pending registration for this email
    if (!pendingVerifications[email]) {
      return res.status(404).json({ message: 'No pending registration found. Please register again.' });
    }

    // Validate the verification code
    if (pendingVerifications[email].verificationCode !== parseInt(verificationCode)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Extract user details
    const { username, password, role } = pendingVerifications[email];

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student',
      isVerified: true,
    });

    await newUser.save();
    delete pendingVerifications[email]; // Remove pending verification after completion

    res.status(201).json({
      success: true,
      message: 'Email verified and user registered successfully. You can now log in.',
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message,
    });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.isVerified) {
        return res.status(400).json({ success: false, message: 'Please verify your email before logging in' });
      }

      res.status(200).json({
        message: 'Login successful',
        role: user.role,
        username: user.username,
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
});

// Create an event
app.post('/events', async (req, res) => {
  try {
    const { title, start, end } = req.body;
    const newEvent = new Event({ title, start, end });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update an event
app.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete an event
app.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Register for an event
app.post('/events/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredStudents.includes(user._id) || user.registeredEvents.includes(event._id)) {
      return res.status(400).json({ message: 'User already registered for the event' });
    }

    event.registeredStudents.push(user._id);
    user.registeredEvents.push(event._id);

    await event.save();
    await user.save();

    res.status(200).json({ message: 'User successfully registered for the event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

// Unregister from an event
app.delete('/events/:id/unregister', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.registeredStudents = event.registeredStudents.filter(studentId => studentId.toString() !== user._id.toString());
    user.registeredEvents = user.registeredEvents.filter(eventId => eventId.toString() !== event._id.toString());

    await event.save();
    await user.save();

    res.status(200).json({ message: 'User successfully unregistered from the event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Error unregistering from event', error: error.message });
  }
});

// Get all events a user is registered for
app.get('/events/registered/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate('registeredEvents');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.registeredEvents);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Error fetching registered events', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});