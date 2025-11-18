const User = require('../models/User');

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
