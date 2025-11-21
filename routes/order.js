const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, orderController.createOrder);
router.get('/my', verifyToken, orderController.getMyOrders);
router.get('/all', verifyToken, orderController.getAllOrders);
router.get('/payment-stats', verifyToken, orderController.getPaymentStats);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);
router.post('/:id/review', verifyToken, orderController.addReview);
router.post('/:id/message', verifyToken, orderController.sendMessage);
router.post('/:id/approve-payment', verifyToken, orderController.approvePayment);

module.exports = router;
