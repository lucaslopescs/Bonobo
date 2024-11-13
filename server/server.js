// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
dotenv.config();  // Load environment variables

// MongoDB URI
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://Bonobo:BonoboBonobo@cluster27349.cp3yc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster27349';

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
    // Use dbURI instead of uri
    await mongoose.connect(dbURI, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if the connection fails
  }
}

// Connect to user.js

const User = require('./User'); // Import the User model

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});



// Run the connection function
run().catch(console.dir);

// Express setup
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.send('School Event Manager API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});