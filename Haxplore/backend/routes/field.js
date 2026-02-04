const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const DayLog = require('../models/DayLog');
const Meeting = require('../models/Meeting');
const Sample = require('../models/Sample');
const Sale = require('../models/Sale');

const router = express.Router();

// Multer config for photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Calculate distance between two GPS coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @route   POST /api/field/start-day
// @desc    Start day with GPS location
router.post('/start-day', protect, async (req, res) => {
    try {
        const { lat, lng } = req.body;

        // Check if already started today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await DayLog.findOne({
            userId: req.user._id,
            date: { $gte: today },
            isActive: true
        });

        if (existingLog) {
            return res.status(400).json({ message: 'Day already started' });
        }

        const dayLog = await DayLog.create({
            userId: req.user._id,
            startTime: new Date(),
            startLocation: { lat, lng }
        });

        res.status(201).json(dayLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/field/end-day
// @desc    End day with GPS location
router.post('/end-day', protect, async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayLog = await DayLog.findOne({
            userId: req.user._id,
            date: { $gte: today },
            isActive: true
        });

        if (!dayLog) {
            return res.status(400).json({ message: 'No active day to end' });
        }

        // Calculate distance
        const distance = calculateDistance(
            dayLog.startLocation.lat,
            dayLog.startLocation.lng,
            lat,
            lng
        );

        dayLog.endTime = new Date();
        dayLog.endLocation = { lat, lng };
        dayLog.totalDistance = distance;
        dayLog.isActive = false;
        await dayLog.save();

        res.json(dayLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/field/today
// @desc    Get today's day log
router.get('/today', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayLog = await DayLog.findOne({
            userId: req.user._id,
            date: { $gte: today }
        });

        res.json(dayLog || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/field/meeting
// @desc    Add a meeting
router.post('/meeting', protect, upload.array('photos', 5), async (req, res) => {
    try {
        const { type, personName, village, category, attendeesCount, lat, lng, notes } = req.body;

        const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const meeting = await Meeting.create({
            userId: req.user._id,
            type,
            personName,
            village,
            category,
            attendeesCount: attendeesCount || 1,
            location: { lat, lng },
            photos,
            notes
        });

        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/field/meetings
// @desc    Get user's meetings for today
router.get('/meetings', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const meetings = await Meeting.find({
            userId: req.user._id,
            timestamp: { $gte: today }
        }).sort({ timestamp: -1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/field/sample
// @desc    Add sample distribution
router.post('/sample', protect, async (req, res) => {
    try {
        const { product, quantity, receiverName, purpose } = req.body;

        const sample = await Sample.create({
            userId: req.user._id,
            product,
            quantity,
            receiverName,
            purpose
        });

        res.status(201).json(sample);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/field/samples
// @desc    Get user's samples for today
router.get('/samples', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const samples = await Sample.find({
            userId: req.user._id,
            date: { $gte: today }
        }).sort({ date: -1 });

        res.json(samples);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/field/sale
// @desc    Add a sale
router.post('/sale', protect, async (req, res) => {
    try {
        const { product, quantity, amount, type, buyerName } = req.body;

        const sale = await Sale.create({
            userId: req.user._id,
            product,
            quantity,
            amount,
            type,
            buyerName
        });

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/field/sales
// @desc    Get user's sales for today
router.get('/sales', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await Sale.find({
            userId: req.user._id,
            date: { $gte: today }
        }).sort({ date: -1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/field/summary
// @desc    Get today's summary for the user
router.get('/summary', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [meetings, samples, sales, activeLog, latestLog] = await Promise.all([
            Meeting.countDocuments({ userId: req.user._id, timestamp: { $gte: today } }),
            Sample.countDocuments({ userId: req.user._id, date: { $gte: today } }),
            Sale.countDocuments({ userId: req.user._id, date: { $gte: today } }),
            DayLog.findOne({ userId: req.user._id, date: { $gte: today }, isActive: true }),
            DayLog.findOne({ userId: req.user._id, date: { $gte: today } }).sort({ createdAt: -1 })
        ]);

        res.json({
            meetingsCount: meetings,
            samplesCount: samples,
            salesCount: sales,
            dayStarted: !!activeLog,
            dayEnded: latestLog && !latestLog.isActive && !activeLog,
            lastEndedTime: latestLog && !latestLog.isActive ? latestLog.endTime : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
