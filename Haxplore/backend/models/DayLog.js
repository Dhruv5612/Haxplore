const mongoose = require('mongoose');

const dayLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    startTime: {
        type: Date
    },
    startLocation: {
        lat: Number,
        lng: Number
    },
    endTime: {
        type: Date
    },
    endLocation: {
        lat: Number,
        lng: Number
    },
    totalDistance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DayLog', dayLogSchema);
