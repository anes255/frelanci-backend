const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.get('/me', verifyToken, userController.getProfile);
router.put('/me', verifyToken, userController.updateProfile);
router.get('/freelancer/:id', userController.getFreelancer);

// Public profile routes
router.get('/profile/:userId', userController.getPublicProfile);
router.get('/works/:userId', userController.getFreelancerWorks);

module.exports = router;
