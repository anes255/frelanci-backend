const Job = require('../models/Job');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Allow both freelancers and maintenance admin to create jobs
    const isMaintenance = user.email === 'maintenance@freelanci.com';
    
    if (user.userType !== 'freelancer' && !isMaintenance) {
      return res.status(403).json({ error: 'Only freelancers can create jobs' });
    }
    
    if (!user.isApproved && !isMaintenance) {
      return res.status(403).json({ error: 'Your account needs admin approval to post jobs' });
    }

    // Get freelancer's current rating
    const averageRating = user.rating || 0;

    const job = await Job.create({
      ...req.body,
      freelancerId: req.user.userId,
      averageRating,
      isPinned: isMaintenance ? true : false // Auto-pin if created by maintenance
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort,
      minRating 
    } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    
    // Filter by minimum rating
    if (minRating) query.averageRating = { $gte: Number(minRating) };
    
    let sortOption = { isPinned: -1, createdAt: -1 }; // Pinned posts first
    
    if (sort === 'price_low') sortOption = { isPinned: -1, price: 1 };
    if (sort === 'price_high') sortOption = { isPinned: -1, price: -1 };
    if (sort === 'popular') sortOption = { isPinned: -1, orders: -1 };
    if (sort === 'rating') sortOption = { isPinned: -1, averageRating: -1 };
    
    const jobs = await Job.find(query)
      .populate('freelancerId', 'name profilePicture rating completedJobs totalRatings')
      .sort(sortOption);
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('freelancerId', 'name profilePicture rating completedJobs fieldOfWork totalRatings ratingBreakdown');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const isMaintenance = user.email === 'maintenance@freelanci.com';
    
    const query = isMaintenance 
      ? { _id: req.params.id } 
      : { _id: req.params.id, freelancerId: req.user.userId };
    
    const job = await Job.findOne(query);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    // Prevent non-maintenance users from setting isPinned
    if (!isMaintenance && req.body.isPinned !== undefined) {
      delete req.body.isPinned;
    }
    
    Object.assign(job, req.body, { updatedAt: Date.now() });
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const isMaintenance = user.email === 'maintenance@freelanci.com';
    
    const query = isMaintenance 
      ? { _id: req.params.id }
      : { _id: req.params.id, freelancerId: req.user.userId };
    
    const job = await Job.findOneAndDelete(query);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFreelancerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      freelancerId: req.params.freelancerId,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get job categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Job.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
