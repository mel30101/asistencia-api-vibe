const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());

// In-memory data storage (Arrays)
const estudiantes = [];
const asistencias = [];

// Validation schemas/regex
const codigoEstudianteRegex = /^EST\d{5}$/;
const estadosPermitidos = ['presente', 'ausente', 'justificada'];

// Utility function to format date and check if it's not a future date
const isDateValidAndNotFuture = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    // Set time to midnight for exact date comparison
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const inputDate = new Date(dateStr);
    
    // We add timezone offset correction since new Date("YYYY-MM-DD") uses UTC zeroes. 
    // This simple approach keeps date logical matching ignoring complex timezone shifts.
    const inputDateNormalized = new Date(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate()
    );
    inputDateNormalized.setHours(0, 0, 0, 0);
    
    return inputDateNormalized <= now;
};


// ==========================================
// RUTAS DE ESTUDIANTES
// ==========================================

// POST /api/estudiantes: Crear estudiante
app.post('/api/estudiantes', (req, res) => {
    const { codigo, nombre } = req.body;

    if (!codigo || !nombre) {
        return res.status(400).json({ error: 'Código y nombre son obligatorios.' });
    }

    if (!codigoEstudianteRegex.test(codigo)) {
        return res.status(400).json({ error: 'El código debe tener el formato EST seguido de 5 dígitos (ej: EST00123).' });
    }

    const existe = estudiantes.find(e => e.codigo === codigo);
    if (existe) {
        return res.status(400).json({ error: 'El estudiante con este código ya existe.' });
    }

    const nuevoEstudiante = { codigo, nombre };
    estudiantes.push(nuevoEstudiante);
    res.status(201).json({ mensaje: 'Estudiante creado exitosamente.', estudiante: nuevoEstudiante });
});

// GET /api/estudiantes: Listar todos
app.get('/api/estudiantes', (req, res) => {
    res.json(estudiantes);
});

// GET /api/estudiantes/:id: Obtener por código
app.get('/api/estudiantes/:id', (req, res) => {
    const { id } = req.params;
    const estudiante = estudiantes.find(e => e.codigo === id);

    if (!estudiante) {
        return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    res.json(estudiante);
});


// ==========================================
// RUTAS DE ASISTENCIAS
// ==========================================

// POST /api/asistencias: Registrar asistencia
app.post('/api/asistencias', (req, res) => {
    const { estudianteId, fecha, estado } = req.body;

    if (!estudianteId || !fecha || !estado) {
        return res.status(400).json({ error: 'estudianteId, fecha y estado son obligatorios.' });
    }

    // Validar estudiante exista
    const estudianteExiste = estudiantes.find(e => e.codigo === estudianteId);
    if (!estudianteExiste) {
        return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    // Validar estado (presente, ausente, justificada)
    if (!estadosPermitidos.includes(estado.toLowerCase())) {
        return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}` });
    }

    // Validar fecha válida y no futura. 
    // Format expected is ideally YYYY-MM-DD
    if (!isDateValidAndNotFuture(fecha)) {
        return res.status(400).json({ error: 'La fecha es inválida o es una fecha futura.' });
    }

    // Parse incoming date for strict string comparison (YYYY-MM-DD)
    let fechaEntrada;
    try {
        fechaEntrada = new Date(fecha).toISOString().split('T')[0];
    } catch (e) {
        return res.status(400).json({ error: 'Formato de fecha no soportado.' });
    }

    // Validar restricción de duplicados: No más de 1 asistencia por misma fecha
    const duplicado = asistencias.find(
        a => a.estudianteId === estudianteId && a.fecha === fechaEntrada
    );

    if (duplicado) {
        return res.status(400).json({ error: 'Ya existe un registro de asistencia para este estudiante en la misma fecha.' });
    }

    const nuevaAsistencia = { estudianteId, fecha: fechaEntrada, estado: estado.toLowerCase() };
    asistencias.push(nuevaAsistencia);

    res.status(201).json({ mensaje: 'Asistencia registrada exitosamente.', asistencia: nuevaAsistencia });
});

// GET /api/asistencias/estudiante/:id: Historial por estudiante
app.get('/api/asistencias/estudiante/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar si el estudiante existe
    const estudianteExiste = estudiantes.find(e => e.codigo === id);
    if (!estudianteExiste) {
         return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    const historial = asistencias.filter(a => a.estudianteId === id);
    res.json(historial);
});


// ==========================================
// REPORTES
// ==========================================

// GET /api/reportes/ausentismo: Top 5 inasistencias
app.get('/api/reportes/ausentismo', (req, res) => {
    const conteoAusencias = {};

    // Contar ausencias por estudianteId
    asistencias.forEach(a => {
        if (a.estado === 'ausente') {
            if (!conteoAusencias[a.estudianteId]) {
                conteoAusencias[a.estudianteId] = 0;
            }
            conteoAusencias[a.estudianteId]++;
        }
    });

    // Formatear a array para poder ordenar
    const ranking = Object.keys(conteoAusencias).map(estudianteId => {
        const estudianteInfo = estudiantes.find(e => e.codigo === estudianteId);
        return {
            estudianteId: estudianteId,
            nombre: estudianteInfo ? estudianteInfo.nombre : 'Desconocido',
            totalAusencias: conteoAusencias[estudianteId]
        };
    });

    // Ordenar de mayor a menor y tomar el Top 5
    ranking.sort((a, b) => b.totalAusencias - a.totalAusencias);
    const top5 = ranking.slice(0, 5);

    res.json({
        mensaje: 'Top 5 estudiantes con mayor número de inasistencias',
        reporte: top5
    });
});

// Manejo de rutas inexistentes (404 Global)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Manejo de errores globales (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Hubo un problema interno en el servidor.' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Servidor corriendo exitosamente en el puerto ${PORT}`);
    console.log(`📍 URL Base: http://localhost:${PORT}`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`   POST  /api/estudiantes`);
    console.log(`   GET   /api/estudiantes`);
    console.log(`   GET   /api/estudiantes/:id`);
    console.log(`   POST  /api/asistencias`);
    console.log(`   GET   /api/asistencias/estudiante/:id`);
    console.log(`   GET   /api/reportes/ausentismo`);
    console.log(`=========================================\n`);
});
