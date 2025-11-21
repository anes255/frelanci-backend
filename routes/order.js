const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// Create order
router.post('/', verifyToken, orderController.createOrder);

// Get routes (specific routes BEFORE :id route)
router.get('/my', verifyToken, orderController.getMyOrders);
router.get('/all', verifyToken, orderController.getAllOrders);
router.get('/payment-stats', verifyToken, orderController.getPaymentStats);

// Get single order by ID (must be after specific routes)
router.get('/:id', verifyToken, orderController.getOrderById);

// Update routes
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);

// Review route
router.post('/:id/review', verifyToken, orderController.addReview);

// Message route
router.post('/:id/message', verifyToken, orderController.sendMessage);

// Payment approval route
router.post('/:id/approve-payment', verifyToken, orderController.approvePayment);

module.exports = router;
