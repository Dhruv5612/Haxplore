const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const DayLog = require('../models/DayLog');
const Meeting = require('../models/Meeting');
const Sample = require('../models/Sample');
const Sale = require('../models/Sale');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
router.get('/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get aggregated stats
        const [
            totalUsers,
            activeToday,
            totalMeetingsToday,
            totalSalesToday,
            totalDistanceToday,
            b2cSales,
            b2bSales,
            stateWiseActivity
        ] = await Promise.all([
            User.countDocuments({ role: 'field' }),
            DayLog.countDocuments({ date: { $gte: today } }),
            Meeting.countDocuments({ timestamp: { $gte: today } }),
            Sale.countDocuments({ date: { $gte: today } }),
            DayLog.aggregate([
                { $match: { date: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$totalDistance' } } }
            ]),
            Sale.countDocuments({ date: { $gte: today }, type: 'B2C' }),
            Sale.countDocuments({ date: { $gte: today }, type: 'B2B' }),
            Meeting.aggregate([
                { $match: { timestamp: { $gte: thirtyDaysAgo } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $group: {
                        _id: '$user.state',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Weekly meetings trend
        const weeklyMeetings = await Meeting.aggregate([
            { $match: { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalFieldOfficers: totalUsers,
            activeToday,
            totalMeetingsToday,
            totalSalesToday,
            totalDistanceToday: totalDistanceToday[0]?.total || 0,
            salesBreakdown: { b2c: b2cSales, b2b: b2bSales },
            stateWiseActivity,
            weeklyMeetings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (optional: filter by active)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const { active } = req.query;
        let query = { role: 'field' };

        if (active === 'true') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find users with active DayLogs today
            const activeLogs = await DayLog.find({
                date: { $gte: today },
                isActive: true
            }).select('userId');

            const activeUserIds = activeLogs.map(log => log.userId);
            query._id = { $in: activeUserIds };
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        // If getting active users, we might want to attach their current location/status?
        // For now, just returning the user objects is enough as requested.

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
router.put('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, phone, role, state, district } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.role = role || user.role;
        user.state = state || user.state;
        user.district = district || user.district;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/reports
// @desc    Get reports
router.get('/reports', protect, adminOnly, async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        const matchQuery = {};
        if (startDate && endDate) {
            matchQuery.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (userId) {
            matchQuery.userId = userId;
        }

        const [meetings, samples, sales, dayLogs] = await Promise.all([
            Meeting.find(matchQuery).populate('userId', 'name email state').sort({ timestamp: -1 }),
            Sample.find({ ...matchQuery, date: matchQuery.timestamp }).populate('userId', 'name email state').sort({ date: -1 }),
            Sale.find({ ...matchQuery, date: matchQuery.timestamp }).populate('userId', 'name email state').sort({ date: -1 }),
            DayLog.find({ ...matchQuery, date: matchQuery.timestamp }).populate('userId', 'name email state').sort({ date: -1 })
        ]);

        res.json({
            meetings,
            samples,
            sales,
            dayLogs,
            summary: {
                totalMeetings: meetings.length,
                totalSamples: samples.length,
                totalSales: sales.length,
                totalDays: dayLogs.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/user-activity/:id
// @desc    Get specific user activity
router.get('/user-activity/:id', protect, adminOnly, async (req, res) => {
    try {
        const userId = req.params.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [meetings, samples, sales, dayLogs] = await Promise.all([
            Meeting.find({ userId }).sort({ timestamp: -1 }).limit(50),
            Sample.find({ userId }).sort({ date: -1 }).limit(50),
            Sale.find({ userId }).sort({ date: -1 }).limit(50),
            DayLog.find({ userId }).sort({ date: -1 }).limit(30)
        ]);

        res.json({ meetings, samples, sales, dayLogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
