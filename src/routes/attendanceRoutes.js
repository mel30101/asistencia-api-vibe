const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Rutas de asistencia
router.post('/', attendanceController.registerAttendance);
router.get('/estudiante/:id', attendanceController.getAttendanceByStudent);

module.exports = router;
