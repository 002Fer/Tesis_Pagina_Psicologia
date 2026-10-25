const { Router } = require('express');
const asistenciasController = require('../controllers/asistencias.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

// Registrar asistencia (solo Profesional o Administrador)
router.post('/', authorize('ADMINISTRADOR', 'PROFESIONAL'), asistenciasController.registrar);

// Consultar asistencias
router.get('/', authorize('ADMINISTRADOR', 'PROFESIONAL'), asistenciasController.getAll);

module.exports = router;
