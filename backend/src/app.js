const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middlewares/error.middleware');

// Rutas
const authRoutes = require('./routes/auth.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const profesionalesRoutes = require('./routes/profesionales.routes');
const espaciosRoutes = require('./routes/espacios.routes');
const citasRoutes = require('./routes/citas.routes');
const seguimientoRoutes = require('./routes/seguimiento.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Ruta de comprobación de estado (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'backend-psicologia',
  });
});

// Registro de endpoints principales
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/seguimientos', seguimientoRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

module.exports = app;
