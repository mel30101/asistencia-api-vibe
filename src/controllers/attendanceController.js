const attendanceService = require('../services/attendanceService');

const registerAttendance = (req, res, next) => {
    try {
        const attendance = attendanceService.registerAttendance(req.body);
        res.status(201).json({ mensaje: 'Asistencia registrada exitosamente.', asistencia: attendance });
    } catch (error) {
        next(error);
    }
};

const getAttendanceByStudent = (req, res, next) => {
    try {
        const { id } = req.params;
        const history = attendanceService.getAttendanceByStudent(id);
        res.json(history);
    } catch (error) {
        next(error);
    }
};

const getAbsenteeismReport = (req, res, next) => {
    try {
        const top5 = attendanceService.getAbsenteeismReport();
        res.json({
            mensaje: 'Top 5 estudiantes con mayor número de inasistencias',
            reporte: top5
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerAttendance,
    getAttendanceByStudent,
    getAbsenteeismReport
};
