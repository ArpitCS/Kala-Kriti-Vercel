const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Offline', 'Online'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    platform: {
        type: String,
        trim: true,
        default: null,
    },
    description: {
        type: String,
        trim: true,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;