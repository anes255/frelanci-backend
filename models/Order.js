const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: { type: Number, required: true },
  requirements: String,
  deliveryDate: Date,
  review: {
    rating: Number,
    comment: String,
    createdAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
