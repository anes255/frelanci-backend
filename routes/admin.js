const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/users', verifyToken, verifyAdmin, adminController.getAllUsers);
router.put('/users/:id/approve', verifyToken, verifyAdmin, adminController.approveUser);
router.delete('/users/:id', verifyToken, verifyAdmin, adminController.deleteUser);
router.get('/orders', verifyToken, verifyAdmin, adminController.getAllOrders);
router.get('/jobs', verifyToken, verifyAdmin, adminController.getAllJobs);

module.exports = router;
