const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

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
  isRated: { type: Boolean, default: false },
  paymentApproved: { type: Boolean, default: false },
  paymentApprovedAt: { type: Date },
  messages: [messageSchema],
  review: {
    rating: Number,
    comment: String,
    createdAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
