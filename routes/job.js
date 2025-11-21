const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/categories/list', jobController.getCategories);
router.get('/:id', jobController.getJobById);
router.put('/:id', verifyToken, jobController.updateJob);
router.delete('/:id', verifyToken, jobController.deleteJob);
router.get('/freelancer/:freelancerId', jobController.getFreelancerJobs);

module.exports = router;
