const request = require('supertest');
const app = require('../index');
const { estudiantes, asistencias } = require('../src/data/storage');

describe('Pruebas de Gestión de Estudiantes', () => {

    beforeEach(() => {
        // Aislamiento: Limpiar el estado interno antes de cada prueba
        estudiantes.length = 0;
        asistencias.length = 0;
    });

    test('1. Registro exitoso de un estudiante con datos válidos (Caso Feliz)', async () => {
        // Arrange
        const nuevoEstudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };

        // Act
        const response = await request(app)
            .post('/api/estudiantes')
            .send(nuevoEstudiante);

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.mensaje).toBe('Estudiante creado exitosamente.');
        expect(response.body.estudiante.codigo).toBe('EST00123');
    });

    test('2. Rechazo si el código no tiene el prefijo EST (Código Inválido)', async () => {
        // Arrange
        const estudianteInvalido = { codigo: 'ABC00123', nombre: 'Juan Perez' };

        // Act
        const response = await request(app)
            .post('/api/estudiantes')
            .send(estudianteInvalido);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('formato EST');
    });

    test('3. Rechazo si el código tiene menos de 5 dígitos tras el prefijo (Longitud de Código)', async () => {
        // Arrange
        const estudianteCorto = { codigo: 'EST123', nombre: 'Juan Perez' };

        // Act
        const response = await request(app)
            .post('/api/estudiantes')
            .send(estudianteCorto);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('formato EST');
    });

    test('4. Rechazo si el código del estudiante ya existe (Duplicidad)', async () => {
        // Arrange
        const estudiante = { codigo: 'EST00123', nombre: 'Juan Perez' };
        await request(app).post('/api/estudiantes').send(estudiante);

        // Act
        const response = await request(app)
            .post('/api/estudiantes')
            .send(estudiante);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('ya existe');
    });

    test('5. Retornar 404 al buscar un estudiante que no está en la base de datos (Búsqueda Inexistente)', async () => {
        // Arrange
        const codigoInexistente = 'EST99999';

        // Act
        const response = await request(app)
            .get(`/api/estudiantes/${codigoInexistente}`);

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Estudiante no encontrado.');
    });

    test('6. Verificar que el GET inicial retorne un arreglo vacío (Listado Vacío)', async () => {
        // Arrange & Act
        const response = await request(app).get('/api/estudiantes');

        // Assert
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    test('7. Verificar que el GET retorne todos los estudiantes registrados (Listado con Datos)', async () => {
        // Arrange
        await request(app).post('/api/estudiantes').send({ codigo: 'EST00001', nombre: 'Estudiante 1' });
        await request(app).post('/api/estudiantes').send({ codigo: 'EST00002', nombre: 'Estudiante 2' });

        // Act
        const response = await request(app).get('/api/estudiantes');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
});
