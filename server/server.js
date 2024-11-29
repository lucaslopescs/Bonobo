const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Event = require('./Event');
const User = require('./User'); // Import the User model

dotenv.config();  // Load environment variables

// MongoDB URI
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Set Mongoose client options
const clientOptions = { 
  serverApi: { 
    version: '1', 
    strict: true, 
    deprecationErrors: true 
  } 
};

// Connect to MongoDB
async function run() {
  try {
    await mongoose.connect(dbURI, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if the connection fails
  }
}

// Express setup
const app = express();
app.use(express.json());
app.use(cors());

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    console.log('Attempting to register user:', username);
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'student'
    });

    // Save to database
    await newUser.save();
    console.log('User saved to database:', username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Send role information with success response
      res.status(200).json({
        message: 'Login successful',
        role: user.role,
        username: user.username
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('School Event Manager API');
});

// Test route to verify database connection and data
app.get('/test-db', async (req, res) => {
  try {
    // Count users
    const userCount = await User.countDocuments();
    
    // Get last 5 users (excluding passwords)
    const recentUsers = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      recentUsers
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
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
    console.log('Received request to update event with ID:', id);
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
    console.log('Received request to delete event with ID:', id);
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      console.log('Event not found:', id);
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('Event deleted successfully:', id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Fetch all events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Run the connection function
run().catch(console.dir);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});