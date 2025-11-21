const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { verifyToken, isMaintenance } = require('../middleware/auth');

router.get('/settings', verifyToken, isMaintenance, maintenanceController.getSettings);
router.put('/settings', verifyToken, isMaintenance, maintenanceController.updateSettings);
router.get('/errors', verifyToken, isMaintenance, maintenanceController.getErrors);
router.delete('/errors', verifyToken, isMaintenance, maintenanceController.clearErrors);
router.get('/stats', verifyToken, isMaintenance, maintenanceController.getStats);
router.get('/payment-stats', verifyToken, isMaintenance, maintenanceController.getPaymentStats);

module.exports = router;
