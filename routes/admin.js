const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.put('/users/:id/approve', verifyToken, isAdmin, adminController.approveUser);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);
router.get('/orders', verifyToken, isAdmin, adminController.getAllOrders);
router.get('/jobs', verifyToken, isAdmin, adminController.getAllJobs);

module.exports = router;
