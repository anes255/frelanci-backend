const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  theme: {
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#FFFFFF' },
    accentColor: { type: String, default: '#1a1a1a' }
  },
  features: {
    jobPosting: { type: Boolean, default: true },
    messaging: { type: Boolean, default: true },
    payments: { type: Boolean, default: true }
  },
  errors: [{
    message: String,
    stack: String,
    user: String,
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AppSettings', appSettingsSchema);
