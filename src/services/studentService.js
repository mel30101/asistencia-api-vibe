const { estudiantes } = require('../data/storage');

const codigoEstudianteRegex = /^EST\d{5}$/;

const getAllStudents = () => {
    return estudiantes;
};

const getStudentByCode = (codigo) => {
    return estudiantes.find(e => e.codigo === codigo);
};

const createStudent = (studentData) => {
    const { codigo, nombre } = studentData;

    if (!codigo || !nombre) {
        throw { status: 400, message: 'Código y nombre son obligatorios.' };
    }

    if (!codigoEstudianteRegex.test(codigo)) {
        throw { status: 400, message: 'El código debe tener el formato EST seguido de 5 dígitos (ej: EST00123).' };
    }

    const existe = getStudentByCode(codigo);
    if (existe) {
        throw { status: 400, message: 'El estudiante con este código ya existe.' };
    }

    const nuevoEstudiante = { codigo, nombre };
    estudiantes.push(nuevoEstudiante);
    return nuevoEstudiante;
};

module.exports = {
    getAllStudents,
    getStudentByCode,
    createStudent
};
