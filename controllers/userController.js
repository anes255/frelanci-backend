const User = require('../models/User');
const Job = require('../models/Job');
const Rating = require('../models/Rating');
const Order = require('../models/Order');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;
    delete updates.rating;
    delete updates.totalRatings;
    delete updates.ratingBreakdown;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFreelancer = async (req, res) => {
  try {
    const freelancer = await User.findOne({
      _id: req.params.id,
      userType: 'freelancer',
      isApproved: true,
      isDeleted: false
    }).select('-password');
    
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    res.json(freelancer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get public profile for any user
exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({
      _id: userId,
      isDeleted: false
    }).select('-password -ccp');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If it's a freelancer, get additional data
    if (user.userType === 'freelancer') {
      // Get all jobs
      const jobs = await Job.find({ 
        freelancerId: userId, 
        isActive: true 
      }).sort({ createdAt: -1 });

      // Get recent ratings
      const ratings = await Rating.find({ freelancerId: userId })
        .populate('clientId', 'name profilePicture')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .limit(10);

      // Get completed orders count
      const completedOrders = await Order.countDocuments({ 
        freelancerId: userId, 
        status: 'completed' 
      });

      return res.json({
        user,
        jobs,
        ratings,
        completedOrders,
        stats: {
          totalJobs: jobs.length,
          averageRating: user.rating,
          totalRatings: user.totalRatings,
          ratingBreakdown: user.ratingBreakdown,
          completedJobs: user.completedJobs
        }
      });
    }

    // For clients, return basic profile
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get freelancer's past works
exports.getFreelancerWorks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({ 
      freelancerId: userId, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const count = await Job.countDocuments({ 
      freelancerId: userId, 
      isActive: true 
    });

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalJobs: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
