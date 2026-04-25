const request = require('supertest');
const app = require('../index');
const { estudiantes, asistencias } = require('../src/data/storage');

describe('Pruebas de Gestión de Asistencias', () => {

    beforeEach(() => {
        // Aislamiento: Limpiar el estado interno antes de cada prueba
        estudiantes.length = 0;
        asistencias.length = 0;
    });

    test('8. Registro exitoso de una asistencia con todos los campos (Asistencia Válida)', async () => {
        // Arrange
        const estudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };
        await request(app).post('/api/estudiantes').send(estudiante);
        const asistencia = { estudianteId: 'EST00123', fecha: '2023-10-10', estado: 'presente' };

        // Act
        const response = await request(app)
            .post('/api/asistencias')
            .send(asistencia);

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.mensaje).toBe('Asistencia registrada exitosamente.');
    });

    test('9. Rechazo si el estado no es presente, ausente o justificada (Estado Inválido)', async () => {
        // Arrange
        const estudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };
        await request(app).post('/api/estudiantes').send(estudiante);
        const asistenciaInvalida = { estudianteId: 'EST00123', fecha: '2023-10-10', estado: 'tarde' };

        // Act
        const response = await request(app)
            .post('/api/asistencias')
            .send(asistenciaInvalida);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Estado inválido');
    });

    test('10. Rechazo si la fecha de asistencia es mayor a la fecha actual (Fecha Futura)', async () => {
        // Arrange
        const estudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };
        await request(app).post('/api/estudiantes').send(estudiante);
        const fechaFutura = '2099-01-01';
        const asistenciaFutura = { estudianteId: 'EST00123', fecha: fechaFutura, estado: 'presente' };

        // Act
        const response = await request(app)
            .post('/api/asistencias')
            .send(asistenciaFutura);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('fecha futura');
    });

    test('11. Rechazo si se intenta registrar al mismo estudiante en la misma fecha (Duplicado de Asistencia)', async () => {
        // Arrange
        const estudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };
        await request(app).post('/api/estudiantes').send(estudiante);
        const asistencia = { estudianteId: 'EST00123', fecha: '2023-10-10', estado: 'presente' };
        await request(app).post('/api/asistencias').send(asistencia);

        // Act
        const response = await request(app)
            .post('/api/asistencias')
            .send(asistencia);

        // Assert
        expect(response.status).toBe(409);
        expect(response.body.error).toContain('Ya existe un registro');
    });

    test('12. Rechazo si se intenta marcar asistencia a un ID que no existe (Estudiante Inexistente)', async () => {
        // Arrange
        const asistenciaSinEstudiante = { estudianteId: 'EST99999', fecha: '2023-10-10', estado: 'presente' };

        // Act
        const response = await request(app)
            .post('/api/asistencias')
            .send(asistenciaSinEstudiante);

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('El estudiante no existe.');
    });
});
