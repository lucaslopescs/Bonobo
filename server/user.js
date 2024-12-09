const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'faculty'],
      default: 'student',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    isVerified: {
      type: Boolean,
      default: false
    }
  });

const User = mongoose.model('User', userSchema);
module.exports = User;