const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Sample', sampleSchema);
