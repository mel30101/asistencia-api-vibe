const request = require('supertest');
const app = require('../index');
const { estudiantes, asistencias } = require('../src/data/storage');

describe('Pruebas de Reportes y Robustez', () => {

    beforeEach(() => {
        // Aislamiento: Limpiar el estado interno antes de cada prueba
        estudiantes.length = 0;
        asistencias.length = 0;
    });

    test('13. Verificación del reporte de ausentismo sin registros previos (Reporte 0 datos)', async () => {
        // Arrange & Act
        const response = await request(app).get('/api/reportes/ausentismo');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.reporte.length).toBe(0);
    });

    test('14. Verificación del Top 5 de ausentismo con datos variados (Reporte Múltiples datos)', async () => {
        // Arrange
        // Crear 6 estudiantes
        for (let i = 1; i <= 6; i++) {
            await request(app).post('/api/estudiantes').send({ codigo: `EST0000${i}`, nombre: `Estudiante ${i}` });
        }
        // EST00001: 3 ausencias, EST00002: 2 ausencias, EST00003: 5 ausencias
        for (let j = 1; j <= 3; j++) {
            await request(app).post('/api/asistencias').send({ estudianteId: 'EST00001', fecha: `2023-10-0${j}`, estado: 'ausente' });
        }
        for (let j = 1; j <= 2; j++) {
            await request(app).post('/api/asistencias').send({ estudianteId: 'EST00002', fecha: `2023-10-0${j}`, estado: 'ausente' });
        }
        for (let j = 1; j <= 5; j++) {
            await request(app).post('/api/asistencias').send({ estudianteId: 'EST00003', fecha: `2023-10-0${j}`, estado: 'ausente' });
        }

        // Act
        const response = await request(app).get('/api/reportes/ausentismo');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.reporte.length).toBe(3);
        expect(response.body.reporte[0].estudianteId).toBe('EST00003');
        expect(response.body.reporte[0].totalAusencias).toBe(5);
    });

    test('15. Enviar campos obligatorios faltantes para verificar la respuesta 400 (Payload Malformado)', async () => {
        // Arrange
        const payloadIncompleto = { nombre: 'Juan Perez' }; // Falta código

        // Act
        const response = await request(app)
            .post('/api/estudiantes')
            .send(payloadIncompleto);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('obligatorios');
    });
});
