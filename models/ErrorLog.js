const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  user: String,
  route: String,
  method: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);
