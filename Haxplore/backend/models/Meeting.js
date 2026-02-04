const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['one-on-one', 'group'],
        required: true
    },
    personName: {
        type: String,
        default: ''
    },
    village: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['farmer', 'seller', 'distributor', 'other'],
        default: 'farmer'
    },
    attendeesCount: {
        type: Number,
        default: 1
    },
    location: {
        lat: Number,
        lng: Number
    },
    photos: [{
        type: String
    }],
    notes: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
