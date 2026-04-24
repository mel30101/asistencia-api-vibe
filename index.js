const serverless = require('serverless-http');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Iniciar servidor solo si no estamos en un entorno serverless
if (require.main === module) {
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
}

// Exportar para Netlify Functions
module.exports = app;
module.exports.handler = serverless(app);
