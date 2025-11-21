const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freelanci_jwt_secret_key_2024_secure';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user.email !== 'freelanciapp@gmail.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const isMaintenance = async (req, res, next) => {
  const maintenanceEmails = ['maintenance@freelanci.com', 'gaheranes1@gmail.com'];
  if (!maintenanceEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Maintenance access required' });
  }
  next();
};

const verifyAdmin = async (req, res, next) => {
  if (req.user.email !== 'freelanciapp@gmail.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const verifySuperAdmin = async (req, res, next) => {
  if (req.user.email !== 'gaheranes1@gmail.com') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isMaintenance, verifyAdmin, verifySuperAdmin, JWT_SECRET };
