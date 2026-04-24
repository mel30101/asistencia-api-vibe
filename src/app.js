const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/estudiantes', studentRoutes);
app.use('/api/asistencias', attendanceRoutes);
app.use('/api/reportes', reportRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
