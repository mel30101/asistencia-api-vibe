const studentService = require('../services/studentService');

const getAllStudents = (req, res, next) => {
    try {
        const students = studentService.getAllStudents();
        res.json(students);
    } catch (error) {
        next(error);
    }
};

const getStudentByCode = (req, res, next) => {
    try {
        const { id } = req.params;
        const student = studentService.getStudentByCode(id);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado.' });
        }
        res.json(student);
    } catch (error) {
        next(error);
    }
};

const createStudent = (req, res, next) => {
    try {
        const student = studentService.createStudent(req.body);
        res.status(201).json({ mensaje: 'Estudiante creado exitosamente.', estudiante: student });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStudents,
    getStudentByCode,
    createStudent
};
