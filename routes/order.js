const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, orderController.createOrder);
router.get('/my', verifyToken, orderController.getMyOrders);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);
router.post('/:id/review', verifyToken, orderController.addReview);

module.exports = router;
