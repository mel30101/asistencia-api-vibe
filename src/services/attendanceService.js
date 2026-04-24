const { asistencias, estudiantes } = require('../data/storage');

const estadosPermitidos = ['presente', 'ausente', 'justificada'];

// Utility function to format date and check if it's not a future date
const isDateValidAndNotFuture = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const inputDate = new Date(dateStr);
    const inputDateNormalized = new Date(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate()
    );
    inputDateNormalized.setHours(0, 0, 0, 0);
    
    return inputDateNormalized <= now;
};

const registerAttendance = (attendanceData) => {
    const { estudianteId, fecha, estado } = attendanceData;

    if (!estudianteId || !fecha || !estado) {
        throw { status: 400, message: 'estudianteId, fecha y estado son obligatorios.' };
    }

    // Validar estudiante exista
    const estudianteExiste = estudiantes.find(e => e.codigo === estudianteId);
    if (!estudianteExiste) {
        throw { status: 404, message: 'El estudiante no existe.' };
    }

    // Validar estado
    if (!estadosPermitidos.includes(estado.toLowerCase())) {
        throw { status: 400, message: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}` };
    }

    // Validar fecha
    if (!isDateValidAndNotFuture(fecha)) {
        throw { status: 400, message: 'La fecha es inválida o es una fecha futura.' };
    }

    let fechaEntrada;
    try {
        fechaEntrada = new Date(fecha).toISOString().split('T')[0];
    } catch (e) {
        throw { status: 400, message: 'Formato de fecha no soportado.' };
    }

    // Validar duplicados
    const duplicado = asistencias.find(
        a => a.estudianteId === estudianteId && a.fecha === fechaEntrada
    );

    if (duplicado) {
        throw { status: 400, message: 'Ya existe un registro de asistencia para este estudiante en la misma fecha.' };
    }

    const nuevaAsistencia = { estudianteId, fecha: fechaEntrada, estado: estado.toLowerCase() };
    asistencias.push(nuevaAsistencia);

    return nuevaAsistencia;
};

const getAttendanceByStudent = (studentId) => {
    const estudianteExiste = estudiantes.find(e => e.codigo === studentId);
    if (!estudianteExiste) {
        throw { status: 404, message: 'Estudiante no encontrado.' };
    }

    return asistencias.filter(a => a.estudianteId === studentId);
};

const getAbsenteeismReport = () => {
    const conteoAusencias = {};

    asistencias.forEach(a => {
        if (a.estado === 'ausente') {
            if (!conteoAusencias[a.estudianteId]) {
                conteoAusencias[a.estudianteId] = 0;
            }
            conteoAusencias[a.estudianteId]++;
        }
    });

    const ranking = Object.keys(conteoAusencias).map(estudianteId => {
        const estudianteInfo = estudiantes.find(e => e.codigo === estudianteId);
        return {
            estudianteId: estudianteId,
            nombre: estudianteInfo ? estudianteInfo.nombre : 'Desconocido',
            totalAusencias: conteoAusencias[estudianteId]
        };
    });

    ranking.sort((a, b) => b.totalAusencias - a.totalAusencias);
    return ranking.slice(0, 5);
};

module.exports = {
    registerAttendance,
    getAttendanceByStudent,
    getAbsenteeismReport
};
