const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'freelanci_jwt_secret_key_2024_secure';

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to include role
    const user = await User.findById(verified.userId).select('-password');
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'User not found or deleted' });
    }
    
    req.user = {
      userId: verified.userId,
      email: verified.email,
      role: user.role,
      userType: user.userType
    };
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  // Accept both email check and role check
  if (req.user.role === 'admin' || req.user.email === 'freelanciapp@gmail.com') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
};

const verifySuperAdmin = async (req, res, next) => {
  // Accept both maintenance role and specific email
  if (req.user.role === 'maintenance' || req.user.email === 'anesgaher3000@gmail.com') {
    return next();
  }
  return res.status(403).json({ error: 'Maintenance access required' });
};

module.exports = { verifyToken, verifyAdmin, verifySuperAdmin, JWT_SECRET };
