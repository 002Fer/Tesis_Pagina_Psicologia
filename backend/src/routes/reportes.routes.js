const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

// Dashboard resumen (Admin y Profesional)
router.get('/dashboard', authorize('ADMINISTRADOR', 'PROFESIONAL'), reportesController.getDashboardSummary);

// Reportes globales (solo ADMINISTRADOR)
router.get('/citas', authorize('ADMINISTRADOR'), reportesController.getCitas);
router.get('/pacientes', authorize('ADMINISTRADOR'), reportesController.getPacientes);
router.get('/profesionales', authorize('ADMINISTRADOR'), reportesController.getProfesionales);
router.get('/espacios', authorize('ADMINISTRADOR'), reportesController.getEspacios);
router.get('/asistencias', authorize('ADMINISTRADOR'), reportesController.getAsistencias);

module.exports = router;
