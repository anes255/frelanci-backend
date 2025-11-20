const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Rate a freelancer (clients only)
router.post('/rate', auth, ratingController.rateFreelancer);

// Get ratings for a freelancer
router.get('/freelancer/:freelancerId', ratingController.getFreelancerRatings);

// Get ratings by current client
router.get('/my-ratings', auth, ratingController.getClientRatings);

// Check if order can be rated
router.get('/check/:orderId', auth, ratingController.checkRatingEligibility);

module.exports = router;
