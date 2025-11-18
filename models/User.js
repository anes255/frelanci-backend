const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['client', 'freelancer'], required: true },
  name: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  fieldOfWork: { type: String },
  profileDescription: { type: String },
  ccp: { type: String },
  skills: [String],
  portfolio: [String],
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
