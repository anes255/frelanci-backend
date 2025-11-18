const Job = require('../models/Job');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.userType !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can create jobs' });
    }
    
    if (!user.isApproved) {
      return res.status(403).json({ error: 'Your account needs admin approval to post jobs' });
    }

    const job = await Job.create({
      ...req.body,
      freelancerId: req.user.userId
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    
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
    
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { orders: -1 };
    
    const jobs = await Job.find(query)
      .populate('freelancerId', 'name profilePicture rating completedJobs')
      .sort(sortOption);
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('freelancerId', 'name profilePicture rating completedJobs fieldOfWork');
    
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
    const job = await Job.findOne({ _id: req.params.id, freelancerId: req.user.userId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
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
    const job = await Job.findOneAndDelete({ 
      _id: req.params.id, 
      freelancerId: req.user.userId 
    });
    
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
