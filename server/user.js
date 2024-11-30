const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
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
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] // List of events the student is registered for
});

const User = mongoose.model('User', userSchema);
module.exports = User;