const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { verifyToken, verifySuperAdmin } = require('../middleware/auth');

router.get('/settings', verifyToken, verifySuperAdmin, maintenanceController.getSettings);
router.put('/settings', verifyToken, verifySuperAdmin, maintenanceController.updateSettings);
router.get('/errors', verifyToken, verifySuperAdmin, maintenanceController.getErrors);
router.delete('/errors', verifyToken, verifySuperAdmin, maintenanceController.clearErrors);
router.get('/stats', verifyToken, verifySuperAdmin, maintenanceController.getStats);

module.exports = router;
