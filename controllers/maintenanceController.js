const AppSettings = require('../models/AppSettings');
const ErrorLog = require('../models/ErrorLog');
const User = require('../models/User');
const Job = require('../models/Job');
const Order = require('../models/Order');

exports.getSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (!settings) {
      settings = await AppSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (!settings) {
      settings = await AppSettings.create(req.body);
    } else {
      Object.assign(settings, req.body, { updatedAt: Date.now() });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getErrors = async (req, res) => {
  try {
    const errors = await ErrorLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(errors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearErrors = async (req, res) => {
  try {
    await ErrorLog.deleteMany({});
    res.json({ message: 'All error logs cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments({ isDeleted: false }),
      totalFreelancers: await User.countDocuments({ userType: 'freelancer', isDeleted: false }),
      totalClients: await User.countDocuments({ userType: 'client', isDeleted: false }),
      pendingApprovals: await User.countDocuments({ userType: 'freelancer', isApproved: false, isDeleted: false }),
      totalJobs: await Job.countDocuments({ isActive: true }),
      totalOrders: await Order.countDocuments(),
      activeOrders: await Order.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      completedOrders: await Order.countDocuments({ status: 'completed' }),
      totalRevenue: await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      recentErrors: await ErrorLog.countDocuments({ 
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      })
    };
    
    stats.totalRevenue = stats.totalRevenue[0]?.total || 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
