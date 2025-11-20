const Rating = require('../models/Rating');
const User = require('../models/User');
const Order = require('../models/Order');
const Job = require('../models/Job');

// Rate a freelancer
exports.rateFreelancer = async (req, res) => {
  try {
    const { orderId, freelancerId, rating, review } = req.body;
    const clientId = req.user.userId;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if order exists and belongs to client
    const order = await Order.findOne({ _id: orderId, clientId, status: 'completed' });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not completed' });
    }

    // Check if already rated
    if (order.isRated) {
      return res.status(400).json({ message: 'Order already rated' });
    }

    // Create rating
    const newRating = new Rating({
      freelancerId,
      clientId,
      orderId,
      jobId: order.jobId,
      rating,
      review
    });

    await newRating.save();

    // Update order
    order.isRated = true;
    order.review = {
      rating,
      comment: review,
      createdAt: new Date()
    };
    await order.save();

    // Update freelancer rating
    const freelancer = await User.findById(freelancerId);
    const allRatings = await Rating.find({ freelancerId });
    
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    // Update rating breakdown
    const ratingBreakdown = {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0
    };

    allRatings.forEach(r => {
      if (r.rating === 5) ratingBreakdown.fiveStar++;
      else if (r.rating === 4) ratingBreakdown.fourStar++;
      else if (r.rating === 3) ratingBreakdown.threeStar++;
      else if (r.rating === 2) ratingBreakdown.twoStar++;
      else if (r.rating === 1) ratingBreakdown.oneStar++;
    });

    freelancer.rating = averageRating;
    freelancer.totalRatings = allRatings.length;
    freelancer.ratingBreakdown = ratingBreakdown;
    await freelancer.save();

    // Update all jobs by this freelancer with new average rating
    await Job.updateMany(
      { freelancerId },
      { averageRating }
    );

    res.status(201).json({ 
      message: 'Rating submitted successfully',
      rating: newRating,
      averageRating
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get ratings for a freelancer
exports.getFreelancerRatings = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ freelancerId })
      .populate('clientId', 'name profilePicture')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Rating.countDocuments({ freelancerId });

    const freelancer = await User.findById(freelancerId);

    res.json({
      ratings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRatings: count,
      averageRating: freelancer.rating,
      ratingBreakdown: freelancer.ratingBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get ratings by client
exports.getClientRatings = async (req, res) => {
  try {
    const clientId = req.user.userId;

    const ratings = await Rating.find({ clientId })
      .populate('freelancerId', 'name profilePicture rating')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if order can be rated
exports.checkRatingEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const clientId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, clientId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const canRate = order.status === 'completed' && !order.isRated;

    res.json({ 
      canRate,
      isRated: order.isRated,
      status: order.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
