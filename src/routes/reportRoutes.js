const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Rutas de reportes
router.get('/ausentismo', attendanceController.getAbsenteeismReport);

module.exports = router;
