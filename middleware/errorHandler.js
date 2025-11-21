const ErrorLog = require('../models/ErrorLog');

const logError = async (error, req) => {
  try {
    await ErrorLog.create({
      message: error.message,
      stack: error.stack,
      user: req.user?.email || 'anonymous',
      route: req.path,
      method: req.method
    });
  } catch (err) {
    console.error('Error logging failed:', err);
  }
};

const errorHandler = async (err, req, res, next) => {
  console.error(err.stack);
  await logError(err, req);
  res.status(500).json({ error: 'Something went wrong!' });
};

module.exports = { errorHandler, logError };
