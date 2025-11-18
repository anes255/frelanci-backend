const Order = require('../models/Order');
const Job = require('../models/Job');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
  try {
    const { jobId, requirements } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const user = await User.findById(req.user.userId);
    if (user.userType !== 'client') {
      return res.status(403).json({ error: 'Only clients can create orders' });
    }
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + job.deliveryTime);
    
    const order = await Order.create({
      jobId,
      clientId: req.user.userId,
      freelancerId: job.freelancerId,
      price: job.price,
      requirements,
      deliveryDate,
      status: 'pending'
    });
    
    job.orders += 1;
    await job.save();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    let query;
    if (user.userType === 'client') {
      query = { clientId: req.user.userId };
    } else {
      query = { freelancerId: req.user.userId };
    }
    
    const orders = await Order.find(query)
      .populate('jobId')
      .populate('clientId', 'name profilePicture')
      .populate('freelancerId', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.freelancerId.toString() !== req.user.userId && 
        order.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();
    
    if (status === 'completed') {
      await User.findByIdAndUpdate(order.freelancerId, {
        $inc: { completedJobs: 1 }
      });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the client can review' });
    }
    
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Order must be completed to review' });
    }
    
    order.review = {
      rating,
      comment,
      createdAt: new Date()
    };
    await order.save();
    
    const freelancerOrders = await Order.find({ 
      freelancerId: order.freelancerId,
      'review.rating': { $exists: true }
    });
    
    const avgRating = freelancerOrders.reduce((sum, o) => sum + o.review.rating, 0) / freelancerOrders.length;
    
    await User.findByIdAndUpdate(order.freelancerId, {
      rating: avgRating.toFixed(1)
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
