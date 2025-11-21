const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Rate a freelancer (clients only)
router.post('/rate', verifyToken, ratingController.rateFreelancer);

// Get ratings for a freelancer
router.get('/freelancer/:freelancerId', ratingController.getFreelancerRatings);

// Get ratings by current client
router.get('/my-ratings', verifyToken, ratingController.getClientRatings);

// Check if order can be rated
router.get('/check/:orderId', verifyToken, ratingController.checkRatingEligibility);

module.exports = router;
